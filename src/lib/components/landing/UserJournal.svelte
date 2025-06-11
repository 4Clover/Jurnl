<script lang="ts">
    import type { UserJournalProps } from '$lib/types/landing.types';
    import type { IEntrySerializable } from '$schemas';
    import { goto } from '$app/navigation';
    import JournalEditDialog from '$lib/components/journal/JournalEditDialog.svelte';

    interface Props extends UserJournalProps {
        onJournalUpdate?: (journalId: string) => void;
    }

    let {
        journalTitle,
        journalColor,
        journalId,
        journalDescription,
        latestJournalEntries,
        onJournalUpdate,
    }: Props = $props();

    // Check if entries are populated objects or just IDs
    const isPopulated = $derived(
        Array.isArray(latestJournalEntries) &&
            latestJournalEntries.length > 0 &&
            typeof latestJournalEntries[0] === 'object' &&
            latestJournalEntries[0] !== null &&
            'title' in latestJournalEntries[0],
    );

    const recentEntries = $derived(
        isPopulated
            ? (latestJournalEntries as IEntrySerializable[]).slice(0, 3)
            : [],
    );

    const entryCount = $derived(latestJournalEntries?.length || 0);

    let showEditDialog = $state(false);

    function handleJournalClick(event: MouseEvent) {
        // Only navigate if clicking on the journal itself, not on entry links
        if (!(event.target as HTMLElement).closest('.entry-preview-link')) {
            goto(`/journals/${journalId}`);
        }
    }

    function handleEntryClick(event: MouseEvent, entryId: string) {
        event.stopPropagation();
        goto(`/journals/${journalId}/entries/${entryId}`);
    }

    function handleJournalKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            goto(`/journals/${journalId}`);
        }
    }

    function handleEntryKeydown(event: KeyboardEvent, entryId: string) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            event.stopPropagation();
            goto(`/journals/${journalId}/entries/${entryId}`);
        }
    }

    function handleSettingsClick(event: MouseEvent) {
        event.stopPropagation();
        showEditDialog = true;
    }

    function handleSettingsKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            event.stopPropagation();
            showEditDialog = true;
        }
    }

    async function handleJournalSave(data: {
        title: string;
        description: string;
        color: string;
    }) {
        try {
            const response = await fetch(`/api/journals/${journalId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: data.title,
                    description: data.description,
                    cover_color: data.color,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || 'Failed to update journal',
                );
            }

            showEditDialog = false;

            // Notify parent component to refresh data
            if (onJournalUpdate) {
                onJournalUpdate(journalId);
            }
        } catch (error) {
            throw error; // Lets dialog handle the error display
        }
    }

    function handleEditCancel() {
        showEditDialog = false;
    }
</script>

<div
    class="user-journal"
    role="button"
    tabindex="0"
    onclick={handleJournalClick}
    onkeydown={handleJournalKeydown}
    aria-label="Open journal: {journalTitle}"
>
    <div class="journal-header">
        <div class="header-content">
            <h3>{journalTitle}</h3>
            <span class="entry-count"
                >{entryCount} {entryCount === 1 ? 'entry' : 'entries'}</span
            >
        </div>
        <button
            class="settings-btn"
            tabindex="0"
            onclick={handleSettingsClick}
            onkeydown={handleSettingsKeydown}
            aria-label="Edit journal settings"
        >
            ⚙️
        </button>
    </div>

    <div class="journal-preview">
        <div class="journal-cover" style="background-color:{journalColor};">
            <div class="journal-icon">📖</div>
        </div>

        <div class="entry-previews">
            {#if recentEntries.length > 0}
                {#each recentEntries as entry}
                    <div
                        class="entry-preview-link"
                        role="button"
                        tabindex="0"
                        onclick={(e) => handleEntryClick(e, entry._id)}
                        onkeydown={(e) => handleEntryKeydown(e, entry._id)}
                        aria-label="Open entry: {entry.title}"
                    >
                        <div class="entry-preview">
                            <span class="entry-title"><p>{entry.title}</p></span>
                            <p class="entry-date">
                                {new Date(
                                    entry.entry_date,
                                ).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                {/each}
                {#if entryCount > 3}
                    <div class="more-entries">
                        +{entryCount - 3} more
                    </div>
                {/if}
            {:else}
                <div class="no-entries">
                    <p>No entries yet</p>
                    <small>Click to add your first entry</small>
                </div>
            {/if}
        </div>
    </div>
</div>

<JournalEditDialog
    isOpen={showEditDialog}
    title={journalTitle}
    description={journalDescription || ''}
    color={journalColor}
    {journalId}
    onSave={handleJournalSave}
    onCancel={handleEditCancel}
/>
