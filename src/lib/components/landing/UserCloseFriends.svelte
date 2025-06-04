<script lang="ts">
    import Page from '$routes/+page.svelte';
    import { json } from '@sveltejs/kit';
    import { formToJSON } from 'axios';
    import { onMount } from 'svelte';

    //import type { UserFriendsProps } from '$lib/types/landing.types';
    //let { closeFriendsList }: UserFriendsProps = $props();
    let { userInfo }: UserProfileProps = $props();
    let friends = $state([]);
    let friendUsername = $state('');
    let successMessage = $state();
    let errorMessage = $state();

    // add a onmount to load all friends
    onMount(async () => {
        try {
            const response = await fetch('/api/friend/getUsernames');
            if (response.ok) {
                const data = await response.json();
                friends = data.result;
            } else {
                const error = await response.json();
                let message = error.error;
                console.log('e', message);
            }
        } catch (error) {
            errorMessage = 'server connection failed';
            successMessage = null;
        }
    });

    const handleSubmit = async (event: Event) => {
        event.preventDefault();
        if (!friendUsername) {
            errorMessage = 'no username provided';
            return;
        }
        try {
            const response = await fetch('/api/friend/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({ username: friendUsername }),
            });
            if (response.ok) {
                const data = await response.json();
                successMessage = data.message;
                friends.push(friendUsername);
                friendUsername = '';
                errorMessage = null;
            } else {
                const error = await response.json();
                errorMessage = error.error;
                console.log('e', errorMessage);
                successMessage = null;
            }
        } catch (error) {
            errorMessage = 'server connection failed';
            successMessage = null;
        }
    };

    async function handleClick(event: Event, username: String) {
        event.preventDefault();
        try {
            const response = await fetch('/api/friend/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ friendUsername: username }),
            });
            if (response.ok) {
                const data = await response.json();
                successMessage = data.message;
                console.log('s', successMessage);
                friends.forEach((friend, index) => {
                    if (friend === username) {
                        friends.splice(index, 1);
                    }
                });
            } else {
                const error = await response.json();
                errorMessage = error.error;
                console.log('e', errorMessage);
                successMessage = null;
            }
        } catch (error) {
            errorMessage = 'server connection failed';
            successMessage = null;
        }
    }
</script>

<h2>My Close Friends</h2>
{#if successMessage}
    <div>{successMessage}</div>
{/if}
{#if errorMessage}
    <div>{errorMessage}</div>
{/if}
<form id="friendForm" onsubmit={handleSubmit}>
    <input
        type="text"
        name="username"
        bind:value={friendUsername}
        placeholder="enter username"
    />
    <button type="submit">Add</button>
</form>

<div class="manage-friends">
    {#each friends as closeFriend}
        <div class="manage-friend">
            <p>{closeFriend}</p>
            <button
                class="delete-friend-button"
                onclick={(event) => handleClick(event, closeFriend)}
                >DELETE</button
            >
        </div>
    {/each}
</div>
