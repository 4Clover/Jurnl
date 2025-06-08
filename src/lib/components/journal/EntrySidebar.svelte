<!--
Sidebar display code written with consultation of 
https://svelte.dev/playground/bcdbbb7f2e584ca58dfd9928887a2923?version=5.33.12 and
https://svelte.dev/docs/svelte/bind
-->
<script lang="ts">
    import type { EntrySidebarProps } from '$lib/types/journal.types';
    import EntrySidebarItem from './EntrySidebarItem.svelte';
    import { page } from '$app/state';
    import CreateJournalEntryButton from '../buttons/CreateJournalEntryButton.svelte';

    // let { entries }: EntrySidebarProps = $props();
</script>

<section class="entry-sidebar">
    <CreateJournalEntryButton/>
    <!-- {#each entries as entry (entry._id)}
        <EntrySidebarItem
            title={entry.title}
            journalID={entry.journal}
            entryID={entry._id}
        />
    {/each} -->

    <EntrySidebarItem
        title="my first entry! ^o^"
        journalID={page['params']['journal']}
        entryID="1"
    />

    <EntrySidebarItem
        title="my second entry! ^o^"
        journalID={page['params']['journal']}
        entryID="2"
    />

    <EntrySidebarItem
        title="my third entry! ^o^"
        journalID={page['params']['journal']}
        entryID="3"
    />

    <EntrySidebarItem
        title="my fourth entry! ^o^"
        journalID={$page['params']['journal']}
        entryID="4"
    />
</section>
