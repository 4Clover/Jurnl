<script lang="ts">
    const props = $props();

    const defaultJournals = [
        {
            title: 'Default Journal',
            entries: [
                { name: 'Paris Arrival', date: '2024-04-15' },
                { name: 'Louvre Visit', date: '2024-04-16' },
                { name: 'Train to Nice', date: '2024-04-18' },
            ],
        },
        {
            title: 'Daily Thoughts',
            entries: [
                { name: 'Monday Motivation', date: '2025-06-02' },
                { name: 'Tuesday Blues', date: '2025-06-03' },
            ],
        },
        {
            title: 'Project Notes',
            entries: [
                { name: 'Kickoff Meeting', date: '2025-05-10' },
                { name: 'First Prototype', date: '2025-05-18' },
                { name: 'Feedback Round', date: '2025-05-25' },
            ],
        },
    ];

    const journalList = props.journalList ?? defaultJournals;
    const type = props.type ?? 'publicEntries';
</script>

<h2>Public Entries</h2>

{#each journalList as journal}
    <h4>{journal.title}</h4>
    <div class="public-entry-journal">
        <div
            class="journal-cover"
            style="background-color: {journal.color}"
        ></div>
        <div class="public-entry-scroll">
            <div class="public-entry-times">
                {#each journal.entries as entry}
                    <p class="public-entry-time">{entry.date}</p>
                {/each}
            </div>
            <div class="public-entry-previews">
                {#each journal.entries as entry}
                    <button
                        onclick={() =>
                            (window.location.href =
                                '/journals/' +
                                journal.id +
                                '/' +
                                type +
                                '/' +
                                entry.id)}
                    >
                        <p class="public-entry-preview">{entry.name}</p>
                        <!--create public viewing version of journal entry-->
                    </button>
                {/each}
            </div>
        </div>
    </div>
{/each}
