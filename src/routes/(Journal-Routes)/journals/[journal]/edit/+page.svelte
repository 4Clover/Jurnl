<style>
    .page-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
    }

    .page-header {
        margin-bottom: 2rem;
    }

    .breadcrumb {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        color: #6b7280;
        margin-bottom: 0.5rem;
        flex-wrap: wrap;
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

    .error-message {
        background-color: #fee;
        border: 1px solid #fcc;
        color: #c00;
        padding: 1rem;
        border-radius: 6px;
        margin-bottom: 1.5rem;
    }

    .journal-form {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 2rem;
    }

    .form-field {
        margin-bottom: 1.5rem;
    }

    .form-field label {
        display: block;
        font-weight: 600;
        margin-bottom: 0.5rem;
        color: #374151;
    }

    .form-field input,
    .form-field textarea {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 1rem;
        transition: border-color 0.2s;
    }

    .form-field input:focus,
    .form-field textarea:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-field textarea {
        resize: vertical;
        min-height: 100px;
    }

    .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 2rem;
    }

    .button {
        padding: 0.75rem 1.5rem;
        border-radius: 6px;
        font-weight: 500;
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

    .button-primary {
        background: #3b82f6;
        color: white;
    }

    .button-primary:hover {
        background: #2563eb;
    }

    .button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>

<script lang="ts">
    import type { PageData } from './$types';
    import { goto } from '$app/navigation';
    import { enhance } from '$app/forms';

    let { data }: { data: PageData } = $props();

    let title = $state(data.journal.title);
    let description = $state(data.journal.description || '');
    let isSubmitting = $state(false);
    let error = $state<string | null>(null);

    async function handleSubmit(e: Event) {
        e.preventDefault();
        if (!title.trim()) {
            error = 'Title is required';
            return;
        }

        isSubmitting = true;
        error = null;

        try {
            const response = await fetch(`/api/journals/${data.journal._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim(),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || 'Failed to update journal',
                );
            }

            await goto(`/journals/${data.journal._id}`);
        } catch (err) {
            error =
                err instanceof Error ? err.message : 'Failed to update journal';
        } finally {
            isSubmitting = false;
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
            <span>Edit</span>
        </nav>
        <h1>Edit Journal</h1>
    </header>

    {#if error}
        <div class="error-message" role="alert">
            {error}
        </div>
    {/if}

    <form onsubmit={handleSubmit} class="journal-form">
        <div class="form-field">
            <label for="title">Journal Title</label>
            <input
                id="title"
                type="text"
                bind:value={title}
                placeholder="Enter journal title"
                disabled={isSubmitting}
                required
            />
        </div>

        <div class="form-field">
            <label for="description">Description (Optional)</label>
            <textarea
                id="description"
                bind:value={description}
                placeholder="Describe your journal..."
                rows="4"
                disabled={isSubmitting}
            ></textarea>
        </div>

        <div class="form-actions">
            <button
                type="button"
                class="button button-secondary"
                onclick={() => window.history.back()}
                disabled={isSubmitting}
            >
                Cancel
            </button>
            <button
                type="submit"
                class="button button-primary"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Updating...' : 'Update Journal'}
            </button>
        </div>
    </form>
</div>
