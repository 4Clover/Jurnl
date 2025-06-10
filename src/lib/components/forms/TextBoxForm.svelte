<script lang="ts">
    let { bioText = $bindable(), isSubmitting } = $props();
</script>

<div class="text-box">
    <textarea
        bind:value={bioText}
        placeholder="Write your bio here..."
        rows="6"
        disabled={isSubmitting}
    ></textarea>
</div>
