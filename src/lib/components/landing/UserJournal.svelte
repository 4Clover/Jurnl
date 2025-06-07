<script lang="ts">
    import type { UserJournalProps } from "$lib/types/landing.types";

    let { journalTitle, journalColor, latestJournalEntries }: UserJournalProps = $props();
</script>

<div class = "user-journal">
    <p>{journalTitle}</p>
    <div class = "journal-cover" style = "background-color:{journalColor};"></div>
        {#each latestJournalEntries as entry}
            <button class = "entry-preview-button" link={/*insert entry link here*/}>
                {entry.title}
            </button>
        {/each}
</div>
