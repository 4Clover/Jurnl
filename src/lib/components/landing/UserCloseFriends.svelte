<script lang="ts">
    import Page from '$routes/+page.svelte';
    import { json } from '@sveltejs/kit';
    import { formToJSON } from 'axios';
    import { onMount } from 'svelte';
    import type { UserProfileProps } from '$types/landing.types';

    let { userInfo }: UserProfileProps = $props();
    let friends = $state([]);
    let launch = $state(true);
    let friendUsername = $state('');
    let successMessage = $state();
    let errorMessage = $state();

    // load all existing friends in db
    $effect(() => {
        if (launch) {
            (async () => {
                await loadExistingFriends();
            })();
            launch = false;
        }
    });

    async function loadExistingFriends() {
        try {
            const response = await fetch('/api/friends');
            if (response.ok) {
                const data = await response.json();
                // API returns the array directly, not wrapped in a result property
                friends = Array.isArray(data) ? data : [];
            } else {
                const error = await response.json();
                let message = error.error;
                console.log('e', message);
            }
        } catch (error) {
            console.log(error);
            errorMessage = 'server connection failed';
            successMessage = null;
        }
    }

    const handleSubmit = async (event: Event) => {
        event.preventDefault();
        if (!friendUsername) {
            errorMessage = 'no username provided';
            return;
        }
        try {
            const response = await fetch('/api/friends', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({ username: friendUsername }),
            });
            if (response.ok) {
                const data = await response.json();
                successMessage = '';
                console.log('s:', successMessage);
                friends.push(friendUsername as never);
                friendUsername = '';
                errorMessage = null;
            } else {
                const error = await response.json();
                errorMessage = error.error;
                console.log('err: ', errorMessage);
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
            const response = await fetch(`/api/friends/${username}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                const data = await response.json();
                successMessage = '';
                console.log('s:', successMessage);
                friends.forEach((friend, index) => {
                    if (friend === username) {
                        friends.splice(index, 1);
                    }
                });
            } else {
                const error = await response.json();
                errorMessage = error.error;
                console.log('err:', errorMessage);
                successMessage = null;
            }
        } catch (error) {
            errorMessage = 'server connection failed';
            successMessage = null;
        }
    }
</script>

<div class="feed-title">
    <h2 class="friend-title">My Close Friends</h2>

    <div class="friend-func">
        <div class="top">
            <form class="addfriend" id="friendForm" onsubmit={handleSubmit}>
                <input
                    type="text"
                    name="username"
                    class="fieldbox__friend"
                    bind:value={friendUsername}
                    placeholder="enter username"
                />
                <button class="addfriend-button button-sm" type="submit">
                    <h3>Add</h3>
                </button>
            </form>

            {#if successMessage}
                <div class="friend-error">{successMessage}</div>
            {/if}
            {#if errorMessage}
                <div class="friend-error">{errorMessage}</div>
            {/if}
        </div>
    </div>
</div>

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
