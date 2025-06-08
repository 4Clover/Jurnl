<script lang="ts">
    import EntryView from '$components/entry/EntryView.svelte'
    import { goto } from '$app/navigation';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();

    let isDeleting = $state(false);
    let showDeleteConfirm = $state(false);

    async function handleDelete() {
        isDeleting = true;
        try {
            const response = await fetch(`/api/journals/${data.journal._id}/entries/${data.entry._id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete entry');
            }

            // Redirect to journal view
            await goto(`/journals/${data.journal._id}`);
        } catch (error) {
            console.error('Error deleting entry:', error);
            alert('Failed to delete entry');
        } finally {
            isDeleting = false;
            showDeleteConfirm = false;
        }
    }
</script>

<div class="page-container">
    <header class="page-header">
        <nav class="breadcrumb">
            <a href="/journals">My Journals</a>
            <span>/</span>
            <a href="/journals/{data.journal._id}">{data.journal.title}</a>
            <span>/</span>
            <span>Entry</span>
        </nav>
        
        <div class="actions">
            <a href="/journals/{data.journal._id}/entries/{data.entry._id}/edit" class="button button-secondary">
                Edit Entry
            </a>
            <button
                type="button"
                class="button button-danger"
                onclick={() => showDeleteConfirm = true}
                disabled={isDeleting}
            >
                Delete
            </button>
        </div>
    </header>
    
    <main>
        <EntryView entry={data.entry} />
    </main>
    
    {#if showDeleteConfirm}
        <div class="modal-backdrop" onclick={() => showDeleteConfirm = false}>
            <div class="modal" onclick={(e) => e.stopPropagation()}>
                <h2>Delete Entry?</h2>
                <p>Are you sure you want to delete "{data.entry.title}"? This action cannot be undone.</p>
                <div class="modal-actions">
                    <button
                        type="button"
                        class="button button-secondary"
                        onclick={() => showDeleteConfirm = false}
                        disabled={isDeleting}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        class="button button-danger"
                        onclick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Entry'}
                    </button>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    .page-container {
        min-height: 100vh;
        background: #f9fafb;
        padding-bottom: 4rem;
    }

    .page-header {
        background: white;
        border-bottom: 1px solid #e5e7eb;
        padding: 1rem 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
    }

    .breadcrumb {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        color: #6b7280;
    }

    .breadcrumb a {
        color: #3b82f6;
        text-decoration: none;
    }

    .breadcrumb a:hover {
        text-decoration: underline;
    }

    .actions {
        display: flex;
        gap: 1rem;
    }

    .button {
        padding: 0.5rem 1rem;
        border-radius: 4px;
        font-weight: 500;
        text-decoration: none;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
        font-size: 0.875rem;
    }

    .button-secondary {
        background: white;
        color: #374151;
        border: 1px solid #d1d5db;
    }

    .button-secondary:hover {
        background: #f3f4f6;
    }

    .button-danger {
        background: #ef4444;
        color: white;
    }

    .button-danger:hover {
        background: #dc2626;
    }

    .button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    main {
        padding: 0 2rem;
    }

    /* Modal */
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 50;
    }

    .modal {
        background: white;
        border-radius: 8px;
        padding: 2rem;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .modal h2 {
        margin: 0 0 1rem 0;
        font-size: 1.25rem;
        font-weight: 600;
    }

    .modal p {
        margin: 0 0 1.5rem 0;
        color: #6b7280;
    }

    .modal-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
    }
</style>