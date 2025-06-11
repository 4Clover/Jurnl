<script lang="ts">
    interface Props {
        isOpen: boolean;
        title: string;
        description: string;
        color: string;
        journalId: string;
        onSave: (data: {
            title: string;
            description: string;
            color: string;
        }) => Promise<void>;
        onCancel: () => void;
    }

    let {
        isOpen = false,
        title = '',
        description = '',
        color = '#a2aec6',
        journalId,
        onSave,
        onCancel,
    }: Props = $props();

    let formTitle = $state(title);
    let formDescription = $state(description);
    let formColor = $state(color);
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
    const isValid = $derived(
        formTitle.trim().length > 0 && formTitle.length <= 100,
    );

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
                color: formColor,
            });
        } catch (err) {
            error =
                err instanceof Error ? err.message : 'Failed to save changes';
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
                    <label for="journal-description" class="form-label"
                        >Description</label
                    >
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
                                    onclick={() => (formColor = presetColor)}
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
