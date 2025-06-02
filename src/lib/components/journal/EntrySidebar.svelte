<!--
Sidebar display code written with consultation of 
https://svelte.dev/playground/bcdbbb7f2e584ca58dfd9928887a2923?version=5.33.12 and
https://svelte.dev/docs/svelte/bind
-->
<script lang="ts">
    import type { EntrySidebarProps } from '$lib/types/journal.types';
    import EntrySidebarItem from './EntrySidebarItem.svelte';

    // let { entries }: EntrySidebarProps = $props();
</script>

<section class="entry-sidebar">
    <!-- {#each entries as entry}
        <EntrySidebarItem
            entryDate={entry.entryDate}
            createdAt={entry.createdAt}
            updatedAt={entry.updatedAt}
        />
    {/each} -->

    <EntrySidebarItem title="my first entry! ^o^" />

    <EntrySidebarItem title="my second entry! ^o^" />

    <EntrySidebarItem title="my third entry! ^o^" />

    <EntrySidebarItem title="my fourth entry! ^o^" />
</section>
