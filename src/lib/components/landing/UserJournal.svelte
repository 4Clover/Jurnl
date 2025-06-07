<script lang="ts">
    import type { UserJournalProps } from "$lib/types/landing.types";
    import {goto} from "$app/navigation";

    let { journalTitle, journalColor, latestJournalEntries }: UserJournalProps = $props();
</script>

<div class = "user-journal">
    <p>{journalTitle}</p>
    <div class = "journal-cover" style = "background-color:{journalColor};"></div>
        {#each latestJournalEntries as entry}
            <button class = "entry-preview-button">
                {entry.title}
            </button>
        {/each}
</div>
