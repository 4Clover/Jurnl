<script lang="ts">
    import type { UserJournalProps } from "$lib/types/landing.types";
    import type { IEntrySerializable } from "$schemas";
    import { goto } from '$app/navigation';
    import JournalEditDialog from '$lib/components/journal/JournalEditDialog.svelte';

    interface Props extends UserJournalProps {
        onJournalUpdate?: (journalId: string) => void;
    }
    
    let { journalTitle, journalColor, journalId, journalDescription, latestJournalEntries, onJournalUpdate }: Props = $props();
    
    // Check if entries are populated objects or just IDs
    const isPopulated = $derived(
        Array.isArray(latestJournalEntries) && 
        latestJournalEntries.length > 0 && 
        typeof latestJournalEntries[0] === 'object' && 
        latestJournalEntries[0] !== null &&
        'title' in latestJournalEntries[0]
    );
    
    const recentEntries = $derived(
        isPopulated ? (latestJournalEntries as IEntrySerializable[]).slice(0, 3) : []
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
    
    async function handleJournalSave(data: { title: string; description: string; color: string }) {
        try {
            const response = await fetch(`/api/journals/${journalId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: data.title,
                    description: data.description,
                    cover_color: data.color
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update journal');
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

<div class="user-journal" 
     role="button" 
     tabindex="0"
     onclick={handleJournalClick}
     onkeydown={handleJournalKeydown}
     aria-label="Open journal: {journalTitle}">
    <div class="journal-header">
        <div class="header-content">
            <h3>{journalTitle}</h3>
            <span class="entry-count">{entryCount} {entryCount === 1 ? 'entry' : 'entries'}</span>
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
                    <div class="entry-preview-link" 
                         role="button"
                         tabindex="0"
                         onclick={(e) => handleEntryClick(e, entry._id)}
                         onkeydown={(e) => handleEntryKeydown(e, entry._id)}
                         aria-label="Open entry: {entry.title}">
                        <div class="entry-preview">
                            <span class="entry-title">{entry.title}</span>
                            <span class="entry-date">
                                {new Date(entry.entry_date).toLocaleDateString()}
                            </span>
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
                    <span>No entries yet</span>
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
    journalId={journalId}
    onSave={handleJournalSave}
    onCancel={handleEditCancel}
/>

<style lang="scss">
    .user-journal {
        background: white;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        transition: all 0.2s;
        min-width: 280px;
        cursor: pointer;
    }

    .user-journal:hover {
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .journal-header {
        padding: 1rem;
        border-bottom: 1px solid #f3f4f6;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
    }

    .header-content {
        flex: 1;
        min-width: 0;
    }

    .journal-header h3 {
        margin: 0 0 0.25rem 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: #111827;
        line-height: 1.25;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .entry-count {
        font-size: 0.75rem;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .journal-preview {
        display: flex;
        height: 160px;
    }

    .journal-cover {
        width: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, var(--color), var(--color-dark, var(--color)));
        position: relative;
        flex-shrink: 0;
    }

    .journal-icon {
        font-size: 1.5rem;
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
    }

    .entry-previews {
        flex: 1;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        justify-content: flex-start;
        overflow: hidden;
    }

    .entry-preview-link {
        text-decoration: none;
        color: inherit;
        display: block;
        transition: all 0.2s;
        border-radius: 4px;
        padding: 0.25rem;
        margin: -0.25rem;
    }

    .entry-preview-link:hover {
        background: #f3f4f6;
        transform: translateX(2px);
    }

    .entry-preview {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #f3f4f6;
    }

    .entry-preview-link:last-child .entry-preview {
        border-bottom: none;
        padding-bottom: 0;
    }

    .entry-title {
        font-size: 0.875rem;
        font-weight: 500;
        color: #374151;
        line-height: 1.25;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .entry-date {
        font-size: 0.75rem;
        color: #9ca3af;
    }

    .more-entries {
        font-size: 0.75rem;
        color: #6b7280;
        font-style: italic;
        text-align: center;
        padding: 0.5rem;
        background: #f9fafb;
        border-radius: 4px;
    }

    .no-entries {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        text-align: center;
        color: #9ca3af;
    }

    .no-entries span {
        font-size: 0.875rem;
        margin-bottom: 0.25rem;
    }

    .no-entries small {
        font-size: 0.75rem;
        color: #d1d5db;
    }

    .settings-btn {
        background: none;
        border: none;
        font-size: 1rem;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 4px;
        transition: all 0.2s;
        color: #6b7280;
        opacity: 0;
        transform: scale(0.9);
        margin-left: 0.5rem;
        flex-shrink: 0;
    }

    .settings-btn:hover, .settings-btn:focus {
        background: #f3f4f6;
        color: #374151;
        transform: scale(1);
    }

    .settings-btn:focus {
        outline: 2px solid #3b82f6;
        outline-offset: 1px;
    }

    .user-journal:hover .settings-btn {
        opacity: 1;
        transform: scale(1);
    }
</style>
