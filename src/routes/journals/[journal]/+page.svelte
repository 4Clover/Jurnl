<script lang="ts">
    import { page } from '$app/stores';
    import EntrySidebar from '$lib/components/journal/EntrySidebar.svelte';
    import JournalBook from '$lib/components/journal/JournalBook.svelte';
</script>

<!-- <h1>Journal</h1> -->
<!-- <pre>
    {JSON.stringify($page, null, 2)}
</pre> -->
<section class="journal-page-content">
<EntrySidebar/>
<JournalBook/>
</section>

