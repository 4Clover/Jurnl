<script lang="ts">
    import type { UserJournalsProps } from "$lib/types/landing.types";

    let { journalList } : UserJournalsProps = $props();
</script>

<h4>My Journals</h4>
<div class = "journal-scroll">
    <!--
    {#each journalList as journal}
        <UserJournal 
            journalTitle={journal.title}
            journalCoverUrl={journal.coverImageUrl}
            latestJournalEntries={}
        />
    {/each}
    -->
    <div class = "user-journal">
        <p>Journal #1</p>
        <div class= journal-preview>
            <!-- Photo by Arina Krasnikova: https://www.pexels.com/photo/a-notebooks-and-pen-5712455/-->
            <img class = "journal-cover" src= "/src/assets/journal-cover-ex.jpg" alt= "A stack of three journals and a pen on top of a brown blanket.">
            <div class = "entry-previews">
                <button>Entry1</button>
                <button>Entry2</button>
                <button>Entry3</button>
                <button>Entry4</button>
                <button>Entry5</button>
            </div>
        </div>
    </div>
    <div class = "user-journal">
        <p>Journal #1</p>
        <div class= journal-preview>
            <!-- Photo by Arina Krasnikova: https://www.pexels.com/photo/a-notebooks-and-pen-5712455/-->
            <img class = "journal-cover" src= "/src/assets/journal-cover-ex.jpg" alt= "A stack of three journals and a pen on top of a brown blanket.">
            <div class = "entry-previews">
                <button>Entry1</button>
                <button>Entry2</button>
                <button>Entry3</button>
                <button>Entry4</button>
                <button>Entry5</button>
            </div>
        </div>
    </div>
    <div class = "user-journal">
        <p>Journal #1</p>
        <div class= journal-preview>
            <!-- Photo by Arina Krasnikova: https://www.pexels.com/photo/a-notebooks-and-pen-5712455/-->
            <img class = "journal-cover" src= "/src/assets/journal-cover-ex.jpg" alt= "A stack of three journals and a pen on top of a brown blanket.">
            <div class = "entry-previews">
                <button>Entry1</button>
                <button>Entry2</button>
                <button>Entry3</button>
                <button>Entry4</button>
                <button>Entry5</button>
            </div>
        </div>
    </div>
    <div class = "user-journal">
        <p>Journal #1</p>
        <div class= journal-preview>
            <!-- Photo by Arina Krasnikova: https://www.pexels.com/photo/a-notebooks-and-pen-5712455/-->
            <img class = "journal-cover" src= "/src/assets/journal-cover-ex.jpg" alt= "A stack of three journals and a pen on top of a brown blanket.">
            <div class = "entry-previews">
                <button>Entry1</button>
                <button>Entry2</button>
                <button>Entry3</button>
                <button>Entry4</button>
                <button>Entry5</button>
            </div>
        </div>
    </div>
    <div class = "user-journal">
        <p>Journal #1</p>
        <div class= journal-preview>
            <!-- Photo by Arina Krasnikova: https://www.pexels.com/photo/a-notebooks-and-pen-5712455/-->
            <img class = "journal-cover" src= "/src/assets/journal-cover-ex.jpg" alt= "A stack of three journals and a pen on top of a brown blanket.">
            <div class = "entry-previews">
                <button>Entry1</button>
                <button>Entry2</button>
                <button>Entry3</button>
                <button>Entry4</button>
                <button>Entry5</button>
            </div>
        </div>
    </div>
</div>