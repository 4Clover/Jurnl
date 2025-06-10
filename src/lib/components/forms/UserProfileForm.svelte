<style>
    .zone-picture-text {
        display: grid;
        width: 20rem;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
    }
</style>

<script lang="ts">
    import { goto } from '$app/navigation';
    import type { UserProfileFormProps } from '$lib/types/profile.types';
    import PrimaryButton from '../buttons/PrimaryButton.svelte';
    import ImageSubmissionForm from './ImageSubmissionForm.svelte';
    import TextBoxForm from './TextBoxForm.svelte';

    let bioText = $state('');
    let pictureUrl = $state<string | null>(null);
    let pictureAlt = $state('');

    let isSubmitting = $state(false);
    let uploadingImage = $state(false);

    let { userInfo }: UserProfileFormProps = $props();

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
            pictureUrl = URL.createObjectURL(file);
            console.log(pictureUrl);
        } catch (err) {
            // error = 'Failed to upload image';
            console.error('Failed to upload image:', err);
            uploadingImage = false;
        }
    }

    async function handleSubmit(e: Event) {
        e.preventDefault();

        console.log(`bioText: ${bioText}`);
        console.log(`pictureUrl: ${pictureUrl}`);

        isSubmitting = true;

        try {
            const response = await fetch(`/api/users/${userInfo?.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bio_image_url: pictureUrl?.trim(),
                    bio_text: bioText.trim(),
                }),
            });

            console.log(response);

            await goto('/landing');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || 'Failed to update profile',
                );
            }
        } catch (error) {
            console.error('Failed to submit user profile info:', error);
        } finally {
            isSubmitting = false;
        }
    }
</script>

<div class="zone zone-picture-text">
    <ImageSubmissionForm
        {pictureUrl}
        {pictureAlt}
        onUpload={handleImageUpload}
        {isSubmitting}
        {uploadingImage}
    />
    <!-- <TextBoxForm {bioText} {isSubmitting} /> -->
    <div class="text-box">
        <textarea
            bind:value={bioText}
            placeholder="Write your bio here..."
            rows="6"
            disabled={isSubmitting}
        ></textarea>
    </div>
</div>
<PrimaryButton text="Submit" onClick={handleSubmit} />
