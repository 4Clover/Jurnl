<script lang="ts">
    import type { PageData } from './$types';
    import { goto } from '$app/navigation';

    let { data }: { data: PageData } = $props();

    let title = $state('');
    let entryDate = $state(new Date().toISOString().split('T')[0]);
    let content = $state('');
    let isSubmitting = $state(false);
    let error = $state<string | null>(null);

    async function handleSubmit(e: Event) {
        e.preventDefault();

        if (!title.trim()) {
            error = 'Entry title is required';
            return;
        }

        isSubmitting = true;
        error = null;

        try {
            const response = await fetch(`/api/journals/${data.journal._id}/entries`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    //@ts-ignore
                    entry_date: new Date(entryDate).toISOString(),
                    content_zones: {
                        picture_text: {
                            image: { url: null, alt: '', caption: '' },
                            text: ''
                        },
                        list: { items: [] },
                        text_right: { content: '' }
                    },
                    free_form_content: content,
                    shared_with_friends: [],
                    attachments: []
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to create entry');
            }

            const entry = await response.json();
            await goto(`/journals/${data.journal._id}/entries/${entry._id}`);
        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to create entry';
        } finally {
            isSubmitting = false;
        }
    }

    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    //?*
</script>

<div class="page-container">
    <header class="page-header">
        <nav class="breadcrumb">
            <a href="/journals">My Journals</a>
            <span>/</span>
            <a href="/journals/{data.journal._id}">{data.journal.title}</a>
            <span>/</span>
            <span>New Entry</span>
        </nav>
        <h1>Create New Entry</h1>
    </header>
    
    <form onsubmit={handleSubmit} class="create-form">
        {#if error}
            <div class="error-message" role="alert">
                {error}
            </div>
        {/if}
        
        <div class="form-group">
            <label for="title">Entry Title</label>
            <input
                id="title"
                type="text"
                bind:value={title}
                placeholder="Today's Adventure"
                maxlength="200"
                required
                disabled={isSubmitting}
            />
        </div>
        
        <div class="form-group">
            <label for="entryDate">Entry Date</label>
            <input
                id="entryDate"
                type="date"
                bind:value={entryDate}
                disabled={isSubmitting}
            />
            <span class="date-preview">{formatDate(entryDate)}</span>
        </div>
        
        <div class="form-group">
            <label for="content">Content</label>
            <textarea
                id="content"
                bind:value={content}
                placeholder="Write about your day..."
                rows="10"
                disabled={isSubmitting}
            ></textarea>
        </div>
        
        <div class="preview">
            <h3>Preview</h3>
            <div class="entry-preview">
                <h4>{title || 'Entry Title'}</h4>
                <time>{formatDate(entryDate)}</time>
                {#if content}
                    <p>{content.slice(0, 200)}{content.length > 200 ? '...' : ''}</p>
                {:else}
                    <p class="placeholder">Your entry content will appear here...</p>
                {/if}
            </div>
        </div>
        
        <div class="form-actions">
            <a href="/journals/{data.journal._id}" class="button button-secondary">
                Cancel
            </a>
            <button
                type="submit"
                class="button button-primary"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Creating...' : 'Create Entry'}
            </button>
        </div>
    </form>
</div>

<style>
    .page-container {
        max-width: 600px;
        margin: 0 auto;
        padding: 2rem;
    }

    .page-header {
        margin-bottom: 3rem;
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
    }

    .create-form {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .error-message {
        background: #fee;
        border: 1px solid #fcc;
        color: #c00;
        padding: 1rem;
        border-radius: 4px;
        margin-bottom: 1.5rem;
    }

    .form-group {
        margin-bottom: 2rem;
    }

    .form-group label {
        display: block;
        font-weight: 500;
        margin-bottom: 0.5rem;
        color: #374151;
    }

    .form-group input[type="text"],
    .form-group input[type="date"],
    .form-group textarea {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 1rem;
        font-family: inherit;
    }

    .form-group input[type="text"]:focus,
    .form-group input[type="date"]:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-group textarea {
        resize: vertical;
        min-height: 200px;
    }

    .date-preview {
        display: block;
        margin-top: 0.5rem;
        font-size: 0.875rem;
        color: #6b7280;
    }

    .preview {
        margin-bottom: 2rem;
    }

    .preview h3 {
        font-size: 1rem;
        font-weight: 500;
        margin-bottom: 0.5rem;
        color: #374151;
    }

    .entry-preview {
        padding: 1.5rem;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        background: #f9fafb;
    }

    .entry-preview h4 {
        margin: 0 0 0.5rem 0;
        font-size: 1.25rem;
        color: #111827;
    }

    .entry-preview time {
        display: block;
        font-size: 0.875rem;
        color: #6b7280;
        margin-bottom: 1rem;
    }

    .entry-preview p {
        margin: 0;
        line-height: 1.6;
        color: #4b5563;
    }

    .entry-preview p.placeholder {
        color: #9ca3af;
        font-style: italic;
    }

    .form-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
    }

    .button {
        padding: 0.75rem 1.5rem;
        border-radius: 6px;
        font-weight: 500;
        text-decoration: none;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
        font-size: 0.875rem;
    }

    .button-primary {
        background: #3b82f6;
        color: white;
    }

    .button-primary:hover:not(:disabled) {
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

    .button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>