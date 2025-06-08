<script lang="ts">
    import FeedItem from './FeedItem.svelte';
    import { onMount } from 'svelte';
    
    const props = $props();
    let friendlist = $state(props.friendList ?? []);
    let loading = $state(true);
    let error = $state('');

    onMount(async () => {
        try {
            const response = await fetch('/api/friend/publicEntries');
            if (response.ok) {
                const data = await response.json();
                // transform to proper format
                friendlist = data.map((friend: any) => ({
                    imgurl: friend.bio_image_url || 'https://i.pinimg.com/736x/6c/21/68/6c21684b57384c2d91d6d86ef2cbe2a4.jpg',
                    username: friend.username_display || friend.username,
                    entries: friend.publicEntries.map((entry: any) => entry.title)
                }));
            } else {
                console.error('Failed to fetch friends data');
                // keep mock data if API fails
            }
        } catch (err) {
            console.error('Error fetching friends data:', err);
            error = 'Failed to load friends data';
        } finally {
            loading = false;
        }
    });
</script>

{#if loading}
    <div class="loading">Loading friends...</div>
{:else if error}
    <div class="error">{error}</div>
{:else if friendlist.length === 0}
    <div class="no-friends">No friends with shared entries yet. Add some friends to see their shared entries here!</div>
{:else}
    {#each friendlist as friend}
        <!-- get user friend list -->
        <FeedItem friend={friend} />
    {/each}
{/if}
