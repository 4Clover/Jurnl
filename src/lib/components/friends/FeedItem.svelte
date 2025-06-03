<script lang="ts">
    let { friend } = $props();
</script>


<div class="feed-item">
    <img src="https://i.pinimg.com/736x/6c/21/68/6c21684b57384c2d91d6d86ef2cbe2a4.jpg" alt="tulips" />
    <div class="feed-item__desc">
        <div class="feed-title">
            <h2 class="feed-title__name">
                {friend.username}
            </h2>
            <button class="feed-title__button primary-button button-lg" onclick={() => (window.location.href = '/feed/friend')}> 
                <h3>Visit</h3>
            </button>
        </div>
        <!-- three entry in an array, fill in entry name and each is a button -->
        {#each friend.entries as entry}
            <button class="feed-entry">
                <h4>{entry}</h4>
            </button>
        {/each}
        
    </div>
</div>