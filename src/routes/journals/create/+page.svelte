<script lang="ts">
    import { goto } from '$app/navigation';

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

    async function handleSubmit(e: Event) {
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
</script>

<div class="page-container">
    <header class="page-header">
        <nav class="breadcrumb">
            <a href="/journals">My Journals</a>
            <span>/</span>
            <span>Create New Journal</span>
        </nav>
        <h1>Create New Journal</h1>
    </header>
    
    <form onsubmit={handleSubmit} class="create-form">
        {#if error}
            <div class="error-message" role="alert">
                {error}
            </div>
        {/if}
        
        <div class="form-group">
            <label for="title">Journal Title</label>
            <input
                id="title"
                type="text"
                bind:value={title}
                placeholder="My Travel Journal"
                maxlength="100"
                required
                disabled={isSubmitting}
            />
        </div>
        
        <div class="form-group">
            <label>Cover Color</label>
            <div class="color-grid">
                {#each presetColors as color}
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
            <div class="custom-color">
                <input
                    type="color"
                    bind:value={coverColor}
                    disabled={isSubmitting}
                />
                <span>{coverColor}</span>
            </div>
        </div>
        
        <div class="preview">
            <h3>Preview</h3>
            <div class="journal-preview" style="background-color: {coverColor}">
                <span>{title || 'Journal Title'}</span>
            </div>
        </div>
        
        <div class="form-actions">
            <a href="/journals" class="button button-secondary">
                Cancel
            </a>
            <button
                type="submit"
                class="button button-primary"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Creating...' : 'Create Journal'}
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

    .form-group input[type="text"] {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 1rem;
    }

    .form-group input[type="text"]:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .color-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1rem;
        margin-bottom: 1rem;
    }

    .color-option {
        width: 100%;
        height: 3rem;
        border: 2px solid transparent;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
    }

    .color-option:hover {
        transform: scale(1.05);
    }

    .color-option.selected {
        border-color: #111827;
        box-shadow: 0 0 0 2px white, 0 0 0 4px #111827;
    }

    .custom-color {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .custom-color input[type="color"] {
        width: 3rem;
        height: 3rem;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        cursor: pointer;
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

    .journal-preview {
        padding: 3rem;
        border-radius: 6px;
        text-align: center;
        color: white;
        font-size: 1.5rem;
        font-weight: 600;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
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