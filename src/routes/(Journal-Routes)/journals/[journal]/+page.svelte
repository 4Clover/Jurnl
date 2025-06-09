<script lang="ts">
    import JournalCover from '$lib/components/journal/JournalCover.svelte';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();

    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
</script>

<!--======== VIEW SINGULAR JOURNAL PAGE========-->

<div class="page-container">
    <header class="page-header">
        <div>
            <nav class="breadcrumb">
                <a href="/journals">My Journals</a>
                <span>/</span>
                <span>{data.journal.title}</span>
            </nav>
            <h1>{data.journal.title}</h1>
        </div>
        
        <div class="actions">
            <a
                href="/journals/{data.journal._id}/entries/create"
                class="button button-primary"
            >
                New Entry
            </a>
            <a
                href="/journals/{data.journal._id}/edit"
                class="button button-secondary"
            >
                Edit Journal
            </a>
        </div>
    </header>

    <JournalCover journalTitle={data.journal.title} journalId={data.journal._id}/>
    
    {#if data.entries.length === 0}
        <div class="empty-state">
            <p>This journal doesn't have any entries yet.</p>
            <a
                href="/journals/{data.journal._id}/entries/create"
                class="button button-primary"
            >
                Create First Entry
            </a>
        </div>
    {:else}
        <div class="entries-list">
            {#each data.entries as entry}
                <article class="entry-card">
                    <a href="/journals/{data.journal._id}/entries/{entry._id}">
                        <h3>{entry.title}</h3>
                        <time>{formatDate(entry.entry_date)}</time>
                        
                        {#if entry.content_zones?.picture_text?.image?.url}
                            <div class="entry-preview has-image">
                                <img
                                    src={entry.content_zones.picture_text.image.url}
                                    alt={entry.content_zones.picture_text.image.alt}
                                />
                                <p>{entry.content_zones.picture_text.text || entry.free_form_content}</p>
                            </div>
                        {:else if entry.free_form_content}
                            <div class="entry-preview">
                                <p>{@html entry.free_form_content.slice(0, 200)}...</p>
                            </div>
                        {/if}
                    </a>
                </article>
            {/each}
        </div>
    {/if}
</div>

<style>
    .page-container {
        max-width: 900px;
        margin: 0 auto;
        padding: 2rem;
    }

    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 3rem;
        padding-bottom: 2rem;
        border-bottom: 1px solid #e5e7eb;
    }

    .breadcrumb {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        color: #6b7280;
        margin-bottom: 0.5rem;
    }

    .breadcrumb a {
        color: #3b82f6;
        text-decoration: none;
    }

    .breadcrumb a:hover {
        text-decoration: underline;
    }

    .page-header h1 {
        font-size: 2.5rem;
        margin: 0;
        color: #111827;
    }

    .actions {
        display: flex;
        gap: 1rem;
    }

    .button {
        padding: 0.75rem 1.5rem;
        border-radius: 6px;
        text-decoration: none;
        font-weight: 500;
        transition: all 0.2s;
        display: inline-block;
        font-size: 0.875rem;
    }

    .button-primary {
        background: #3b82f6;
        color: white;
    }

    .button-primary:hover {
        background: #2563eb;
    }

    .button-secondary {
        background: white;
        color: #374151;
        border: 1px solid #d1d5db;
    }

    .button-secondary:hover {
        background: #f3f4f6;
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

    .entries-list {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .entry-card {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 1.5rem;
        transition: all 0.2s;
    }

    .entry-card:hover {
        border-color: #d1d5db;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .entry-card a {
        text-decoration: none;
        color: inherit;
    }

    .entry-card h3 {
        font-size: 1.5rem;
        margin: 0 0 0.5rem 0;
        color: #111827;
    }

    .entry-card time {
        font-size: 0.875rem;
        color: #6b7280;
    }

    .entry-preview {
        margin-top: 1rem;
        color: #4b5563;
        line-height: 1.6;
    }

    .entry-preview.has-image {
        display: grid;
        grid-template-columns: 150px 1fr;
        gap: 1rem;
        align-items: start;
    }

    .entry-preview img {
        width: 100%;
        height: 100px;
        object-fit: cover;
        border-radius: 4px;
    }

    .entry-preview p {
        margin: 0;
    }
</style>