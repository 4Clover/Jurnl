<script lang="ts">
    let { friend } = $props();
</script>

<div class="feed-item">
    <!-- This is where the bio image will go-->
    <img src={friend.imgurl} alt="tulips" />
    <div class="feed-item__desc">
        <div class="feed-title">
            <h2 class="feed-title__name">
                {friend.username}
            </h2>
            <button
                class="feed-title__button primary-button button-lg"
                onclick={() =>
                    (window.location.href = '/feed/' + friend.username)}
            >
                <h3>Visit</h3>
            </button>
        </div>
        <!-- three entry in an array, fill in entry name and each is a button -->
        {#each friend.entries as entry}
            <button
                class="feed-entry"
                onclick={() =>
                    (window.location.href =
                        '/journals/' +
                        entry.journal +
                        '/publicEntries/' +
                        entry._id)}
            >
                <h4>{entry.title}</h4>
                <!--create public viewing version of journal entry-->
            </button>
        {/each}
    </div>
</div>
