<script lang="ts">
    let { data }: PageProps = $props();
    data.user.closeFriends
</script>

<h2>My Close Friends</h2>
<!-- add friends form -->
<!-- check if close friends list has been modified - call get usernames route again & update the state -->
<div class="manage-friends">
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
