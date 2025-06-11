<script lang="ts">
    import '../../../styles/main.scss';

    let { pictureUrl, pictureAlt, onUpload, isSubmitting, uploadingImage } =
        $props();
</script>

<div class="image-submission-form">
    {#if pictureUrl}
        <div class="pfp-preview">
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
        <label class="pfp-upload">
            <input
                type="file"
                accept="image/*"
                onchange={onUpload}
                disabled={isSubmitting || uploadingImage}
            />
            <div class="pfp-upload-placeholder">
                {#if uploadingImage}
                    <span>Uploading...</span>
                {:else}
                    <span>Click to add image</span>
                {/if}
            </div>
        </label>
    {/if}
</div>
