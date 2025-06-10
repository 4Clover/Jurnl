<style>
    .zone-picture-text {
        display: grid;
        width: 20rem;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
    }
</style>

<script lang="ts">
    import ImageSubmissionForm from './ImageSubmissionForm.svelte';
    import TextBoxForm from './TextBoxForm.svelte';

    let bioText = $state('');
    let pictureUrl = $state<string | null>(null);
    let pictureAlt = $state('');

    let isSubmitting = $state(false);
</script>

<div class="zone zone-picture-text">
    <ImageSubmissionForm {pictureUrl} {pictureAlt} {isSubmitting} />
    <TextBoxForm {bioText} {isSubmitting} />
</div>
