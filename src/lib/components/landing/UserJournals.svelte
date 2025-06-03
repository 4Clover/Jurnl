<script lang="ts">
    import type { UserJournalsProps } from "$lib/types/landing.types";

    let { journalList } : UserJournalsProps = $props();
</script>

<h2>My Journals</h2>
<div class = "journal-scroll">
    <!--
    {#each journalList as journal}
        <UserJournal 
            journalTitle={journal.title}
            journalCoverUrl={journal.cover_color}
            latestJournalEntries={/*not sure how this will be done yet*/}
        />
    {/each}
    -->

    <div class = "user-journal">
        <p>Journal #1</p>
        <div class= journal-preview>
            <!-- Photo by Arina Krasnikova: https://www.pexels.com/photo/a-notebooks-and-pen-5712455/-->
            <img class = "journal-cover" src= "/src/assets/journal-cover-ex.jpg" alt= "A stack of three journals and a pen on top of a brown blanket.">
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
            <!-- Photo by Arina Krasnikova: https://www.pexels.com/photo/a-notebooks-and-pen-5712455/-->
            <img class = "journal-cover" src= "/src/assets/journal-cover-ex.jpg" alt= "A stack of three journals and a pen on top of a brown blanket.">
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
            <!-- Photo by Arina Krasnikova: https://www.pexels.com/photo/a-notebooks-and-pen-5712455/-->
            <img class = "journal-cover" src= "/src/assets/journal-cover-ex.jpg" alt= "A stack of three journals and a pen on top of a brown blanket.">
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
            <!-- Photo by Arina Krasnikova: https://www.pexels.com/photo/a-notebooks-and-pen-5712455/-->
            <img class = "journal-cover" src= "/src/assets/journal-cover-ex.jpg" alt= "A stack of three journals and a pen on top of a brown blanket.">
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
            <!-- Photo by Arina Krasnikova: https://www.pexels.com/photo/a-notebooks-and-pen-5712455/-->
            <img class = "journal-cover" src= "/src/assets/journal-cover-ex.jpg" alt= "A stack of three journals and a pen on top of a brown blanket.">
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