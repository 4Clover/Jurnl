<script lang="ts">
    import type { UserJournalProps } from "$lib/types/landing.types";

    let { journalTitle, journalCoverUrl, latestJournalEntries }: UserJournalProps = $props();
</script>

<div class = "user-journal">
    <p>{journalTitle}</p>
    <div class= journal-preview>
        <img class = "journal-cover" src= {journalCoverUrl} alt="User uploaded image.">
        {#each latestJournalEntries as entry, i}
            <button class = "entry-preview-button" href={/*insert entry link here*/}>
                `Entry {i}`
            </button>
        {/each}
        <p class = "entry-preview">{journalLatestEntryPreview}...</p>
    </div>
</div>