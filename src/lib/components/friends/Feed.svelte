<script lang="ts">
    import FeedItem from './FeedItem.svelte';
    import { onMount } from 'svelte';

    const props = $props();
    let friendlist = $state(props.friendList ?? []);
    let loading = $state(true);
    let error = $state('');

    onMount(async () => {
        try {
            const response = await fetch('/api/friends/entries');

            if (response.status === 401) {
                console.error('User not authenticated');
                error = 'Please log in to view your friends feed';
                loading = false;
                return;
            }

            if (response.ok) {
                const data = await response.json();
                console.log('API response:', data);

                // API now returns the array directly, not wrapped in a result property
                if (Array.isArray(data)) {
                    // transform to proper format
                    friendlist = data.map((friend: any) => ({
                        imgurl:
                            friend.bio_image_url ||
                            'https://i.pinimg.com/736x/6c/21/68/6c21684b57384c2d91d6d86ef2cbe2a4.jpg',
                        username: friend.username || friend.username_display,
                        entries: friend.publicEntries || [],
                    }));
                    console.log(`Loaded ${friendlist.length} friends`);
                } else {
                    console.error(
                        'Invalid response format - expected array:',
                        data,
                    );
                    friendlist = [];
                }
            } else {
                const errorData = await response.json();
                console.error(
                    'Failed to fetch friends data:',
                    response.status,
                    errorData,
                );
                error = errorData.error || 'Failed to load friends data';
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
    <div class="loading"><p>Loading friends...</p></div>
{:else if error}
    <div class="error">{error}</div>
{:else if friendlist.length === 0}
    <div class="no-friends">
        <p>
            No friends have shared entries with you yet. Add some friends so
            they can see your shared entries!
        </p>
    </div>
{:else}
    {#each friendlist as friend}
        <!-- get user friend list -->
        <FeedItem {friend} />
    {/each}
{/if}
