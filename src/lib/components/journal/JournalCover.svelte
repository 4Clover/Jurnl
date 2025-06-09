<script lang="ts">
    import type { JournalCoverProps } from "$lib/types/journal.types";
    import JournalMenu from "./JournalMenu.svelte";
    let {journalTitle, journalId}: JournalCoverProps= $props();
</script>

<div class="journal-book-cover">
    <JournalMenu journalTitle={journalTitle} journalId={journalId}/>
</div>
