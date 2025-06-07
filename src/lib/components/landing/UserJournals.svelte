<script lang="ts">
    import type { UserJournalsProps } from "$lib/types/landing.types";
    import UserJournal from "$lib/components/landing/UserJournal.svelte";

    let { journalList } : UserJournalsProps = $props();
</script>

<h2>My Journals</h2>
<div class = "journal-scroll">

    {#each journalList as journal}
        <UserJournal
            journalTitle={journal.title}
            journalColor={journal.cover_color}
            latestJournalEntries={journal.entries}
        />
    {/each}


    <div class = "user-journal">
        <p>Journal #1</p>
        <div class= journal-preview>
            <div class = "journal-cover" style = "background-color:#a2aec6;"></div>
            <div class = "entry-previews">
                <button class = "entry-preview-button" >Entry 1</button>
                <button class = "entry-preview-button" >Entry 2</button>
                <button class = "entry-preview-button" >Entry 3</button>
                <button class = "entry-preview-button" >Entry 4</button>
                <button class = "entry-preview-button" >Entry 5</button>
            </div>
        </div>
    </div>
    <div class = "user-journal">
        <p>Journal #2</p>
        <div class= journal-preview>
            <div class = "journal-cover" style = "background-color:#a2aec6;"></div>
            <div class = "entry-previews">
                <button class = "entry-preview-button" >Entry 1</button>
                <button class = "entry-preview-button" >Entry 2</button>
                <button class = "entry-preview-button" >Entry 3</button>
                <button class = "entry-preview-button" >Entry 4</button>
                <button class = "entry-preview-button" >Entry 5</button>
            </div>
        </div>
    </div>
    <div class = "user-journal">
        <p>Journal #3</p>
        <div class= journal-preview>
            <div class = "journal-cover" style = "background-color:#a2aec6;"></div>
            <div class = "entry-previews">
                <button class = "entry-preview-button" >Entry 1</button>
                <button class = "entry-preview-button" >Entry 2</button>
                <button class = "entry-preview-button" >Entry 3</button>
                <button class = "entry-preview-button" >Entry 4</button>
                <button class = "entry-preview-button" >Entry 5</button>
            </div>
        </div>
    </div>
    <div class = "user-journal">
        <p>Journal #4</p>
        <div class= journal-preview>
            <div class = "journal-cover" style = "background-color:#a2aec6;"></div>
            <div class = "entry-previews">
                <button class = "entry-preview-button" >Entry 1</button>
                <button class = "entry-preview-button" >Entry 2</button>
                <button class = "entry-preview-button" >Entry 3</button>
                <button class = "entry-preview-button" >Entry 4</button>
                <button class = "entry-preview-button" >Entry 5</button>
            </div>
        </div>
    </div>
    <div class = "user-journal">
        <p>Journal #5</p>
        <div class= journal-preview>
            <div class = "journal-cover" style = "background-color:#a2aec6;"></div>
            <div class = "entry-previews">
                <button class = "entry-preview-button" >Entry 1</button>
                <button class = "entry-preview-button" >Entry 2</button>
                <button class = "entry-preview-button" >Entry 3</button>
                <button class = "entry-preview-button" >Entry 4</button>
                <button class = "entry-preview-button" >Entry 5</button>
            </div>
        </div>
    </div>
</div>