<script lang="ts">
    import { goto } from '$app/navigation';
    import type { IEntrySerializable } from '$schemas';

    interface Props {
        journalId: string;
        onSuccess?: (entry: IEntrySerializable) => void;
    }

    let { journalId, onSuccess }: Props = $props();

    // Zone states
    let title = $state('');
    let pictureUrl = $state<string | null>(null);
    let pictureAlt = $state('');
    let pictureCaption = $state('');
    let pictureText = $state('');
    let listItems = $state<Array<{ text: string; checked: boolean }>>([]);
    let textRight = $state('');
    let freeFormContent = $state('');

    // UI states
    let isSubmitting = $state(false);
    let error = $state<string | null>(null);
    let uploadingImage = $state(false);

    // Add a new list item
    function addListItem() {
        listItems = [...listItems, { text: '', checked: false }];
    }

    // Remove a list item
    function removeListItem(index: number) {
        listItems = listItems.filter((_, i) => i !== index);
    }

    // Update list item text
    function updateListItem(index: number, text: string) {
        listItems = listItems.map((item, i) =>
            i === index ? { ...item, text } : item
        );
    }

    // Toggle list item checked state
    function toggleListItem(index: number) {
        listItems = listItems.map((item, i) =>
            i === index ? { ...item, checked: !item.checked } : item
        );
    }

    // Handle image upload (placeholder - implement actual upload logic)
    async function handleImageUpload(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        uploadingImage = true;
        try {
            // TODO: Implement actual image upload to your storage service
            // For now, using a data URL as placeholder
            const reader = new FileReader();
            reader.onload = (e) => {
                pictureUrl = e.target?.result as string;
                uploadingImage = false;
            };
            reader.readAsDataURL(file);
        } catch (err) {
            error = 'Failed to upload image';
            uploadingImage = false;
        }
    }

    // Submit the entry
    async function handleSubmit(e: Event) {
        e.preventDefault();
        if (!title.trim()) {
            error = 'Title is required';
            return;
        }

        isSubmitting = true;
        error = null;

        try {
            const entryData = {
                title: title.trim(),
                entry_date: new Date().toISOString(),
                content_zones: {
                    picture_text: {
                        image: {
                            url: pictureUrl,
                            alt: pictureAlt,
                            caption: pictureCaption
                        },
                        text: pictureText
                    },
                    list: {
                        items: listItems.filter(item => item.text.trim())
                    },
                    text_right: {
                        content: textRight
                    }
                },
                free_form_content: freeFormContent,
                shared_with_friends: []
            };

            const response = await fetch(`/api/journals/${journalId}/entries`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entryData)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to create entry');
            }

            const newEntry = await response.json();

            if (onSuccess) {
                onSuccess(newEntry);
            } else {
                await goto(`/journals/${journalId}/entries/${newEntry._id}`);
            }
        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to create entry';
        } finally {
            isSubmitting = false;
        }
    }
</script>

<div class="templated-entry-form">
    {#if error}
        <div class="error-message" role="alert">
            {error}
        </div>
    {/if}
    
    <form onsubmit={handleSubmit}>
        <!-- Zone 1: Title -->
        <div class="zone zone-title">
            <input
                type="text"
                bind:value={title}
                placeholder="Entry Title"
                class="title-input"
                disabled={isSubmitting}
                required
            />
        </div>
        
        <!-- Zone 2: Picture + Text (Two Column) -->
        <div class="zone zone-picture-text">
            <div class="picture-box">
                {#if pictureUrl}
                    <div class="image-preview">
                        <img src={pictureUrl} alt={pictureAlt} />
                        <button
                            type="button"
                            class="remove-image"
                            onclick={() => pictureUrl = null}
                            disabled={isSubmitting}
                        >
                            ×
                        </button>
                    </div>
                {:else}
                    <label class="image-upload">
                        <input
                            type="file"
                            accept="image/*"
                            onchange={handleImageUpload}
                            disabled={isSubmitting || uploadingImage}
                        />
                        <div class="upload-placeholder">
                            {#if uploadingImage}
                                <span>Uploading...</span>
                            {:else}
                                <span>📷 Click to add image</span>
                            {/if}
                        </div>
                    </label>
                {/if}
                
                {#if pictureUrl}
                    <input
                        type="text"
                        bind:value={pictureAlt}
                        placeholder="Image alt text"
                        class="image-field"
                        disabled={isSubmitting}
                    />
                    <input
                        type="text"
                        bind:value={pictureCaption}
                        placeholder="Image caption"
                        class="image-field"
                        disabled={isSubmitting}
                    />
                {/if}
            </div>
            
            <div class="text-box">
				<textarea
                    bind:value={pictureText}
                    placeholder="Write about your image..."
                    rows="6"
                    disabled={isSubmitting}
                ></textarea>
            </div>
        </div>
        
        <!-- Zone 3: List -->
        <div class="zone zone-list">
            <div class="zone-header">
                <h3>List Items</h3>
                <button
                    type="button"
                    class="add-button"
                    onclick={addListItem}
                    disabled={isSubmitting}
                >
                    + Add Item
                </button>
            </div>
            
            <div class="list-items">
                {#each listItems as item, index}
                    <div class="list-item">
                        <input
                            type="checkbox"
                            bind:checked={item.checked}
                            disabled={isSubmitting}
                        />
                        <input
                            type="text"
                            value={item.text}
                            oninput={(e) => updateListItem(index, e.currentTarget.value)}
                            placeholder="List item..."
                            disabled={isSubmitting}
                        />
                        <button
                            type="button"
                            class="remove-button"
                            onclick={() => removeListItem(index)}
                            disabled={isSubmitting}
                        >
                            ×
                        </button>
                    </div>
                {/each}
                
                {#if listItems.length === 0}
                    <p class="empty-state">No list items yet. Click "Add Item" to start.</p>
                {/if}
            </div>
        </div>
        
        <!-- Zone 4: Text Right -->
        <div class="zone zone-text-right">
            <h3>Additional Notes</h3>
            <textarea
                bind:value={textRight}
                placeholder="Additional thoughts..."
                rows="4"
                disabled={isSubmitting}
            ></textarea>
        </div>
        
        <!-- Zone 5: Free Form Content -->
        <div class="zone zone-freeform">
            <h3>Free Writing</h3>
            <textarea
                bind:value={freeFormContent}
                placeholder="Write freely here..."
                rows="10"
                class="freeform-textarea"
                disabled={isSubmitting}
            ></textarea>
        </div>
        
        <!-- Submit -->
        <div class="form-actions">
            <button
                type="button"
                class="cancel-button"
                onclick={() => window.history.back()}
                disabled={isSubmitting}
            >
                Cancel
            </button>
            <button
                type="submit"
                class="submit-button"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Creating...' : 'Create Entry'}
            </button>
        </div>
    </form>
</div>

<style>
    .templated-entry-form {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
    }

    .error-message {
        background-color: #fee;
        border: 1px solid #fcc;
        color: #c00;
        padding: 1rem;
        border-radius: 4px;
        margin-bottom: 1rem;
    }

    .zone {
        margin-bottom: 2rem;
        padding: 1.5rem;
        background: #f9fafb;
        border-radius: 8px;
        border: 1px solid #e5e7eb;
    }

    .zone-title {
        background: white;
    }

    .title-input {
        width: 100%;
        font-size: 1.5rem;
        font-weight: 600;
        padding: 0.75rem;
        border: 1px solid #d1d5db;
        border-radius: 4px;
    }

    .zone-picture-text {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
    }

    .picture-box {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .image-upload input[type="file"] {
        display: none;
    }

    .upload-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 200px;
        background: white;
        border: 2px dashed #d1d5db;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
    }

    .upload-placeholder:hover {
        border-color: #9ca3af;
        background: #f9fafb;
    }

    .image-preview {
        position: relative;
    }

    .image-preview img {
        width: 100%;
        height: 200px;
        object-fit: cover;
        border-radius: 4px;
    }

    .remove-image {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        border: none;
        border-radius: 50%;
        width: 2rem;
        height: 2rem;
        font-size: 1.2rem;
        cursor: pointer;
    }

    .image-field {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        font-size: 0.875rem;
    }

    .text-box textarea,
    .zone-text-right textarea,
    .freeform-textarea {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        resize: vertical;
    }

    .zone-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }

    .zone-header h3 {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
    }

    .add-button {
        padding: 0.5rem 1rem;
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.875rem;
    }

    .add-button:hover {
        background: #2563eb;
    }

    .list-items {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .list-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .list-item input[type="text"] {
        flex: 1;
        padding: 0.5rem;
        border: 1px solid #d1d5db;
        border-radius: 4px;
    }

    .remove-button {
        background: #ef4444;
        color: white;
        border: none;
        border-radius: 4px;
        width: 2rem;
        height: 2rem;
        cursor: pointer;
    }

    .empty-state {
        color: #6b7280;
        font-style: italic;
        text-align: center;
        padding: 2rem;
    }

    .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 2rem;
    }

    .cancel-button,
    .submit-button {
        padding: 0.75rem 1.5rem;
        border-radius: 4px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
    }

    .cancel-button {
        background: white;
        color: #374151;
        border: 1px solid #d1d5db;
    }

    .cancel-button:hover {
        background: #f3f4f6;
    }

    .submit-button {
        background: #10b981;
        color: white;
        border: none;
    }

    .submit-button:hover {
        background: #059669;
    }

    .submit-button:disabled,
    .cancel-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .zone-picture-text {
            grid-template-columns: 1fr;
        }
    }
</style>