<script lang="ts">
    
</script>


<div class="feed-item">
    <img src="https://i.pinimg.com/736x/6c/21/68/6c21684b57384c2d91d6d86ef2cbe2a4.jpg" alt="tulips" />
    <div class="feed-item__desc">
        <div class="feed-title">
            <h2 class="feed-title__name">
                Username
            </h2>
            <button class="feed-title__button primary-button button-lg"> 
                <h3>Visit</h3>
            </button>
        </div>
        <!-- three entry in an array, fill in entry name and each is a button -->
        {#each Array(3) as _, i}
            <button class="feed-entry">
                <h4>Entry {i+1}</h4>
            </button>
        {/each}
        
    </div>
</div>