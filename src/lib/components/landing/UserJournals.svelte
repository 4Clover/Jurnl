<script lang="ts">
    import type { UserJournalsProps } from "$lib/types/landing.types";
    import UserJournal from "$lib/components/landing/UserJournal.svelte";
    import { goto } from '$app/navigation';

    let { journalList } : UserJournalsProps = $props();
    
    let showCreateForm = $state(false);
    let title = $state('');
    let coverColor = $state('#4B5563');
    let isSubmitting = $state(false);
    let error = $state<string | null>(null);

    const presetColors = [
        '#4B5563', // Gray
        '#EF4444', // Red
        '#F59E0B', // Amber
        '#10B981', // Emerald
        '#3B82F6', // Blue
        '#8B5CF6', // Violet
        '#EC4899', // Pink
        '#14B8A6', // Teal
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
</script>

<div class="journals-section">
    <div class="section-header">
        <h2>My Journals</h2>
        {#if journalList.length > 0}
            <button 
                class="create-button"
                onclick={() => showCreateForm = true}
                disabled={showCreateForm}
            >
                + New Journal
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
                <a href="/journals/{journal._id}" class="journal-link">
                    <UserJournal
                        journalTitle={journal.title}
                        journalColor={journal.cover_color}
                        latestJournalEntries={journal.entries || []}
                    />
                </a>
            {/each}
        </div>
    {/if}
</div>

<style lang="scss">
    .journals-section {
        width: 100%;
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
    }

    .section-header h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: #111827;
    }

    .create-button {
        background: #3b82f6;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;
    }

    .create-button:hover:not(:disabled) {
        background: #2563eb;
    }

    .create-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .create-form-container {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .quick-create-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .error-message {
        background: #fee;
        border: 1px solid #fcc;
        color: #c00;
        padding: 0.75rem;
        border-radius: 4px;
        font-size: 0.875rem;
    }

    .form-row {
        display: flex;
        gap: 1rem;
        align-items: center;
    }

    .title-input {
        flex: 1;
        padding: 0.75rem;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 1rem;
    }

    .title-input:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .color-picker {
        display: flex;
        gap: 0.5rem;
    }

    .color-option {
        width: 2rem;
        height: 2rem;
        border: 2px solid transparent;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
    }

    .color-option:hover {
        transform: scale(1.1);
    }

    .color-option.selected {
        border-color: #111827;
        box-shadow: 0 0 0 2px white, 0 0 0 4px #111827;
    }

    .form-actions {
        display: flex;
        gap: 0.75rem;
        justify-content: flex-end;
    }

    .cancel-button, .create-submit-button {
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
        font-size: 0.875rem;
    }

    .cancel-button {
        background: white;
        color: #374151;
        border: 1px solid #d1d5db;
    }

    .cancel-button:hover:not(:disabled) {
        background: #f3f4f6;
    }

    .create-submit-button {
        background: #3b82f6;
        color: white;
    }

    .create-submit-button:hover:not(:disabled) {
        background: #2563eb;
    }

    .create-submit-button:disabled, .cancel-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .empty-state {
        background: #f9fafb;
        border: 2px dashed #d1d5db;
        border-radius: 8px;
        padding: 3rem;
        text-align: center;
    }

    .empty-content h3 {
        margin: 0 0 0.5rem 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #374151;
    }

    .empty-content p {
        margin: 0 0 2rem 0;
        color: #6b7280;
        font-size: 1rem;
    }

    .create-first-button {
        background: #3b82f6;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 6px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;
    }

    .create-first-button:hover {
        background: #2563eb;
    }

    .journal-scroll {
        display: flex;
        gap: 1.5rem;
        overflow-x: auto;
        padding-bottom: 1rem;
    }

    .journal-link {
        text-decoration: none;
        color: inherit;
        flex-shrink: 0;
        transition: transform 0.2s;
    }

    .journal-link:hover {
        transform: translateY(-2px);
    }
</style>