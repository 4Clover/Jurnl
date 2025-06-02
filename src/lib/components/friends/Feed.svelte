<script lang="ts">
    import FeedItem from "./FeedItem.svelte";
    
</script>

<!-- Array(3) is the array of friends -->
{#each Array(3) as _, i} <!-- get user friend list -->
    <FeedItem /> 
{/each}