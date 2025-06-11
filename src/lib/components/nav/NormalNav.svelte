<script lang="ts">
    import LogInOutButton from '$lib/components/buttons/LogInOutButton.svelte';
</script>

<!-- <button class="pajamas--hamburger" aria-label="Menu Button"></button> -->
<button onclick={() => (window.location.href = '/landing')}>
    <h1 class="navbar__logo">Jurnl</h1>
</button>

<div class="navbar__links" id="navbar-links">
    <a href="/landing">Landing</a>
    <a href="/feed">Friends' Feed</a>
    <a href="/journals">My Journals</a>
    <a href="/profile">Edit Profile</a>
</div>
<LogInOutButton />
