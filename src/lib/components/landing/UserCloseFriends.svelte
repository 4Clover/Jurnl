<script lang="ts">
    import type { UserFriendsProps } from "$lib/types/landing.types";

    let { closeFriendsList } : UserFriendsProps = $props();
</script>

<h2>My Close Friends</h2>
<div class="manage-friends">
    <!--
    {#each closeFriendsList as closeFriend}
        <div class="manage-friend">
            <p>{closeFriend}</p>
            <button class="delete-friend-button">DELETE</button>
        </div>
    {/each}
    -->
    
    <div class="manage-friend">
        <p>Friend 1</p>
        <button class="delete-friend-button">DELETE</button>
    </div>
    <div class="manage-friend">
        <p>Friend 2</p>
        <button class="delete-friend-button">DELETE</button>
    </div>
    <div class="manage-friend">
        <p>Friend 3</p>
        <button class="delete-friend-button">DELETE</button>
    </div>
    <div class="manage-friend">
        <p>Friend 4</p>
        <button class="delete-friend-button">DELETE</button>
    </div>
    <div class="manage-friend">
        <p>Friend 5</p>
        <button class="delete-friend-button">DELETE</button>
    </div>
</div>