<script lang="ts">
    import type { JournalCoverProps } from "$lib/types/journal.types";
    import JournalMenu from "./JournalMenu.svelte";
    let {journalTitle, journalId, coverColor}: JournalCoverProps= $props();
</script>

<div class="journal-book-cover">
    <svg width="464" height="613" viewBox="0 0 464 613" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M464 12H447H17V601V613H464V12Z" fill="#E1D4CB"/>
        <path d="M0 0H447V12V601H17H0V0Z" fill={coverColor}/>
        <path d="M17 613V601H0L17 613Z" fill="#E1D4CB"/>
        <path d="M447 12H464L447 0V12Z" fill="#E1D4CB"/>
    </svg>
    <JournalMenu journalTitle={journalTitle} journalId={journalId}/>
</div>
