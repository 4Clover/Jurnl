<script lang="ts">
    import { page } from '$app/stores';
    import EntrySidebar from '$lib/components/journal/EntrySidebar.svelte';
    import JournalCover from '$lib/components/journal/JournalCover.svelte';
</script>

<!-- <h1>Journal</h1> -->
<!-- <pre>
    {JSON.stringify($page, null, 2)}
</pre> -->
<section class="journal-page-content">
<EntrySidebar/>
<JournalCover/>
</section>

