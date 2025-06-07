<script lang="ts">
    import FeedItem from './FeedItem.svelte';
    const props = $props();
    const friendlist = props.friendList ?? [
        {
            imgurl: 'https://i.pinimg.com/736x/6c/21/68/6c21684b57384c2d91d6d86ef2cbe2a4.jpg',
            username: 'alice',
            entries: ['My First Entry', 'Travel Log', 'Reflections'],
        },
        {
            imgurl: 'https://i.pinimg.com/736x/6c/21/68/6c21684b57384c2d91d6d86ef2cbe2a4.jpg',
            username: 'bob',
            entries: ['Dreams', 'Workout Journal', 'Tech Notes'],
        },
        {
            imgurl: 'https://i.pinimg.com/736x/6c/21/68/6c21684b57384c2d91d6d86ef2cbe2a4.jpg',
            username: 'charlie',
            entries: ['Books I Read', 'Food Diary', 'Ideas'],
        },
    ];
</script>

{#each friendlist as friend}
    <!-- get user friend list -->
    <FeedItem friend={friend} />
{/each}
