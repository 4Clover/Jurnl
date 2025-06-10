<script lang="ts">
    import type { UserJournalsProps } from "$lib/types/landing.types";
    import UserJournal from "$lib/components/landing/UserJournal.svelte";
    import { goto } from '$app/navigation';

    let { journalList } : UserJournalsProps = $props();

    let refreshTrigger = $state(0);
    
    let showCreateForm = $state(false);
    let title = $state('');
    let coverColor = $state('#a2aec6');
    let isSubmitting = $state(false);
    let error = $state<string | null>(null);

    const presetColors = [
        '#a2aec6', // baby blue
        '#999f85', // sage
        '#e1d4cb', // beige
        '#bf95aa', // powder pink
        '#e0a699', 
        '#b1a0ba', 
        '#a0bab7', 
        '#bad9b6',
    ];

    async function handleCreateJournal(e: Event) {
        e.preventDefault();

        if (!title.trim()) {
            error = 'Journal title is required';
            return;
        }

        isSubmitting = true;
        error = null;

        try {
            const response = await fetch('/api/journals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    cover_color: coverColor
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to create journal');
            }

            const journal = await response.json();
            await goto(`/journals/${journal._id}`);
        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to create journal';
        } finally {
            isSubmitting = false;
        }
    }

    function cancelCreate() {
        showCreateForm = false;
        title = '';
        coverColor = '#4B5563';
        error = null;
    }

    function handleJournalUpdate(journalId: string) {
        // Trigger refresh of the journal list
        refreshTrigger++;
        // In a real app, you'd call an API to refresh the data
        // For now, we'll let the parent component handle the refresh
        window.location.reload();
    }
</script>

<div class="journals-section">
    <div class="section-header">
        <h2>My Journals</h2>
        {#if journalList.length > 0}
            <button 
                class="create-button sm-button"
                onclick={() => showCreateForm = true}
                disabled={showCreateForm}
            >
                <h3>Create New Journal</h3>
            </button>
        {/if}
    </div>

    {#if showCreateForm}
        <div class="create-form-container">
            <form onsubmit={handleCreateJournal} class="quick-create-form">
                {#if error}
                    <div class="error-message" role="alert">
                        {error}
                    </div>
                {/if}
                
                <div class="form-row">
                    <input
                        type="text"
                        bind:value={title}
                        placeholder="Journal title..."
                        maxlength="100"
                        required
                        disabled={isSubmitting}
                        class="title-input"
                    />
                    
                    <div class="color-picker">
                        {#each presetColors.slice(0, 4) as color}
                            <button
                                type="button"
                                class="color-option"
                                class:selected={coverColor === color}
                                style="background-color: {color}"
                                onclick={() => coverColor = color}
                                disabled={isSubmitting}
                                aria-label="Select {color} color"
                            ></button>
                        {/each}
                    </div>
                </div>
                
                <div class="form-actions">
                    <button
                        type="button"
                        class="cancel-button"
                        onclick={cancelCreate}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        class="create-submit-button"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Creating...' : 'Create'}
                    </button>
                </div>
            </form>
        </div>
    {/if}

    {#if journalList.length === 0 && !showCreateForm}
        <div class="empty-state">
            <div class="empty-content">
                <h3>No journals yet</h3>
                <p>Create your first journal to start writing!</p>
                <button 
                    class="create-first-button"
                    onclick={() => showCreateForm = true}
                >
                    Create Your First Journal
                </button>
            </div>
        </div>
    {:else if journalList.length > 0}
        <div class="journal-scroll">
            {#each journalList as journal}
                <UserJournal
                    journalTitle={journal.title}
                    journalColor={journal.cover_color}
                    journalId={String(journal._id)}
                    journalDescription={journal.description}
                    latestJournalEntries={journal.entries || []}
                    onJournalUpdate={handleJournalUpdate}
                />
            {/each}
        </div>
    {/if}
</div>