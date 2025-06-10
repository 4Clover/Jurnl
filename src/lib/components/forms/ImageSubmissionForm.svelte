<script lang="ts">
    import '../../../styles/main.scss';

    // let pictureUrl = $state<string | null>(null);
    // let pictureAlt = $state('');

    let uploadingImage = $state(false);

    let { pictureUrl, pictureAlt, isSubmitting } = $props();

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
                    <span>Click to add image</span>
                {/if}
            </div>
        </label>
    {/if}
</div>
