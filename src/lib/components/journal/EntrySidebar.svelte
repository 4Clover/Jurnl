<script lang="ts">
    import type { EntrySidebarProps } from '$lib/types/journal.types';
    import EntrySidebarItem from './EntrySidebarItem.svelte';

    let { entries }: EntrySidebarProps = $props();
</script>

<section class="flex-col">
    {#each entries as entry}
        <EntrySidebarItem
            entryDate={entry.entryDate}
            createdAt={entry.createdAt}
            updatedAt={entry.updatedAt}
        />
    {/each}
</section>
