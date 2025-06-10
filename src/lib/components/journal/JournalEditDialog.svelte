<script lang="ts">
    interface Props {
        isOpen: boolean;
        title: string;
        description: string;
        color: string;
        journalId: string;
        onSave: (data: { title: string; description: string; color: string }) => Promise<void>;
        onCancel: () => void;
    }

    let { 
        isOpen = false, 
        title = '',
        description = '',
        color = '#4B5563',
        journalId,
        onSave, 
        onCancel
    }: Props = $props();

    let formTitle = $state(title);
    let formDescription = $state(description);
    let formColor = $state(color);
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

    // Reset form when dialog opens/closes or props change
    $effect(() => {
        if (isOpen) {
            formTitle = title;
            formDescription = description;
            formColor = color;
            error = null;
        }
    });

    const remainingChars = $derived(500 - (formDescription?.length || 0));
    const isValid = $derived(formTitle.trim().length > 0 && formTitle.length <= 100);

    async function handleSave() {
        if (!isValid) {
            error = 'Title is required and must be 100 characters or less';
            return;
        }

        if (formDescription.length > 500) {
            error = 'Description must be 500 characters or less';
            return;
        }

        isSubmitting = true;
        error = null;

        try {
            await onSave({
                title: formTitle.trim(),
                description: formDescription.trim(),
                color: formColor
            });
        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to save changes';
        } finally {
            isSubmitting = false;
        }
    }

    function handleCancel() {
        onCancel();
    }

    function handleBackdropClick(e: MouseEvent) {
        if (e.target === e.currentTarget) {
            handleCancel();
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            handleCancel();
        }
    }

    function handleFormSubmit(e: Event) {
        e.preventDefault();
        handleSave();
    }
</script>

{#if isOpen}
    <div 
        class="dialog-backdrop" 
        onclick={handleBackdropClick}
        onkeydown={handleKeydown}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        tabindex="-1"
    >
        <div class="dialog-content">
            <h2 id="dialog-title" class="dialog-title">Edit Journal</h2>
            
            <form onsubmit={handleFormSubmit} class="edit-form">
                {#if error}
                    <div class="error-message" role="alert">
                        {error}
                    </div>
                {/if}
                
                <div class="form-group">
                    <label for="journal-title" class="form-label">Title</label>
                    <input
                        id="journal-title"
                        type="text"
                        bind:value={formTitle}
                        placeholder="Journal title..."
                        maxlength="100"
                        required
                        disabled={isSubmitting}
                        class="form-input"
                        class:error={!isValid && formTitle.length > 0}
                    />
                    <div class="form-help">
                        {formTitle.length}/100 characters
                    </div>
                </div>

                <div class="form-group">
                    <label for="journal-description" class="form-label">Description</label>
                    <textarea
                        id="journal-description"
                        bind:value={formDescription}
                        placeholder="Describe your journal..."
                        maxlength="500"
                        disabled={isSubmitting}
                        class="form-textarea"
                        class:error={formDescription.length > 500}
                        rows="3"
                    ></textarea>
                    <div class="form-help" class:error={remainingChars < 0}>
                        {remainingChars} characters remaining
                    </div>
                </div>

                <div class="form-group">
                    <fieldset>
                        <legend class="form-label">Cover Color</legend>
                        <div class="color-picker">
                        {#each presetColors as presetColor}
                            <button
                                type="button"
                                class="color-option"
                                class:selected={formColor === presetColor}
                                style="background-color: {presetColor}"
                                onclick={() => formColor = presetColor}
                                disabled={isSubmitting}
                                aria-label="Select {presetColor} color"
                            ></button>
                        {/each}
                        </div>
                    </fieldset>
                </div>
            </form>
            
            <div class="dialog-actions">
                <button 
                    type="button"
                    class="button button-secondary"
                    onclick={handleCancel}
                    disabled={isSubmitting}
                >
                    Cancel
                </button>
                <button 
                    type="button"
                    class="button button-primary"
                    onclick={handleSave}
                    disabled={isSubmitting || !isValid}
                >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    </div>
{/if}

<style lang="scss">
    .dialog-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    .dialog-content {
        background: white;
        border-radius: 12px;
        padding: 2rem;
        max-width: 520px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
        from {
            transform: translateY(-20px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    .dialog-title {
        margin: 0 0 1.5rem 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: #111827;
    }

    .edit-form {
        margin-bottom: 2rem;
    }

    .form-group {
        margin-bottom: 1.5rem;
    }

    .form-label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #374151;
        font-size: 0.875rem;
    }

    .form-input, .form-textarea {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 1rem;
        transition: border-color 0.2s, box-shadow 0.2s;
        background: white;
    }

    .form-input:focus, .form-textarea:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-input.error, .form-textarea.error {
        border-color: #ef4444;
    }

    .form-input.error:focus, .form-textarea.error:focus {
        border-color: #ef4444;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }

    .form-textarea {
        resize: vertical;
        min-height: 80px;
    }

    .form-help {
        margin-top: 0.25rem;
        font-size: 0.75rem;
        color: #6b7280;
    }

    .form-help.error {
        color: #ef4444;
    }

    fieldset {
        border: none;
        padding: 0;
        margin: 0;
    }

    legend {
        padding: 0;
    }

    .error-message {
        background: #fee;
        border: 1px solid #fcc;
        color: #c00;
        padding: 0.75rem;
        border-radius: 4px;
        font-size: 0.875rem;
        margin-bottom: 1rem;
    }

    .color-picker {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
    }

    .color-option {
        width: 2.5rem;
        height: 2.5rem;
        border: 2px solid transparent;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
        position: relative;
    }

    .color-option:hover {
        transform: scale(1.1);
    }

    .color-option.selected {
        border-color: #111827;
        box-shadow: 0 0 0 2px white, 0 0 0 4px #111827;
    }

    .color-option:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }

    .dialog-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
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

    .button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .button-secondary {
        background: white;
        color: #374151;
        border: 1px solid #d1d5db;
    }

    .button-secondary:hover:not(:disabled) {
        background: #f3f4f6;
    }

    .button-primary {
        background: #3b82f6;
        color: white;
    }

    .button-primary:hover:not(:disabled) {
        background: #2563eb;
    }

    @media (max-width: 480px) {
        .dialog-content {
            padding: 1.5rem;
            width: 95%;
        }

        .dialog-actions {
            flex-direction: column-reverse;
        }

        .button {
            width: 100%;
        }

        .color-picker {
            justify-content: center;
        }
    }
</style>