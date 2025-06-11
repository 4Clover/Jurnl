<script lang="ts">
    import '../../../styles/main.scss';

    let { pictureUrl, pictureAlt, onUpload, isSubmitting, uploadingImage } =
        $props();
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
                onchange={onUpload}
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
