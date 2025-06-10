<style>
    .zone-picture-text {
        display: grid;
        width: 20rem;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
    }
    .picture-box {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    .image-upload input[type='file'] {
        display: none;
    }

    .upload-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 200px;
        width: 300px;
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
        width: 300px;
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
</style>

<script lang="ts">
    let pictureUrl = $state<string | null>(null);
    let pictureAlt = $state('');
    let bioText = $state('');

    let isSubmitting = $state(false);
    let uploadingImage = $state(false);

    async function handleImageUpload(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        uploadingImage = true;
        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                pictureUrl = e.target?.result as string;
                uploadingImage = false;
            };
            reader.readAsDataURL(file);
        } catch (err) {
            // error = 'Failed to upload image';
            console.error('Failed to upload image:', err);
            uploadingImage = false;
        }
    }
</script>

<div class="zone zone-picture-text">
    <div class="picture-box">
        {#if pictureUrl}
            <div class="image-preview">
                <img src={pictureUrl} alt={pictureAlt} />
                <button
                    type="button"
                    class="remove-image"
                    onclick={() => (pictureUrl = null)}
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
    </div>

    <div class="text-box">
        <textarea
            bind:value={bioText}
            placeholder="Write your bio here..."
            rows="6"
            disabled={isSubmitting}
        ></textarea>
    </div>
</div>
