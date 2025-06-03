<script lang="ts">
    import FeedItem from "./FeedItem.svelte";

    let { friendlist = [
    {
      username: "alice",
      entries: ["My First Entry", "Travel Log", "Reflections"]
    },
    {
      username: "bob",
      entries: ["Dreams", "Workout Journal", "Tech Notes"]
    },
    {
      username: "charlie",
      entries: ["Books I Read", "Food Diary", "Ideas"]
    }
  ] } = $props();
    
</script>

<!-- Array(3) is the array of friends -->
{#each friendlist as friend} <!-- get user friend list -->
    <FeedItem {friend} /> 
{/each}