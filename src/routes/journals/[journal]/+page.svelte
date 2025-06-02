<!--
Sidebar display code written with consultation of 
https://svelte.dev/playground/bcdbbb7f2e584ca58dfd9928887a2923?version=5.33.12 and
https://svelte.dev/docs/svelte/bind
-->

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
    <EntrySidebar />
    <JournalCover />
</section>
