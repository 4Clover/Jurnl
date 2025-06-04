<script lang="ts">
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>

<div class="page-container">
    <header class="page-header">
        <h1>My Journals</h1>
        <a href="/journals/create" class="button button-primary">
            Create New Journal
        </a>
    </header>
    
    {#if data.journals.length === 0}
        <div class="empty-state">
            <p>You haven't created any journals yet.</p>
            <a href="/journals/create" class="button button-primary">
                Create Your First Journal
            </a>
        </div>
    {:else}
        <div class="journals-grid">
            {#each data.journals as journal}
                <a href="/journals/{journal._id}" class="journal-card">
                    <div
                        class="journal-cover"
                        style="background-color: {journal.cover_color}"
                    >
                        <h2>{journal.title}</h2>
                    </div>
                    <div class="journal-meta">
                        <span>{journal.entries?.length || 0} entries</span>
                        <span>Created {new Date(journal.createdAt).toLocaleDateString()}</span>
                    </div>
                </a>
            {/each}
        </div>
    {/if}
</div>

<style>
    .page-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
    }

    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 3rem;
    }

    .page-header h1 {
        font-size: 2.5rem;
        margin: 0;
    }

    .button {
        padding: 0.75rem 1.5rem;
        border-radius: 6px;
        text-decoration: none;
        font-weight: 500;
        transition: all 0.2s;
        display: inline-block;
    }

    .button-primary {
        background: #3b82f6;
        color: white;
    }

    .button-primary:hover {
        background: #2563eb;
    }

    .empty-state {
        text-align: center;
        padding: 4rem;
        background: #f9fafb;
        border-radius: 8px;
    }

    .empty-state p {
        font-size: 1.125rem;
        color: #6b7280;
        margin-bottom: 2rem;
    }

    .journals-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 2rem;
    }

    .journal-card {
        display: block;
        text-decoration: none;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        transition: all 0.2s;
    }

    .journal-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .journal-cover {
        padding: 3rem 2rem;
        text-align: center;
    }

    .journal-cover h2 {
        color: white;
        margin: 0;
        font-size: 1.5rem;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .journal-meta {
        background: white;
        padding: 1rem;
        display: flex;
        justify-content: space-between;
        font-size: 0.875rem;
        color: #6b7280;
    }
</style>