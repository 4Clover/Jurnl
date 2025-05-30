<script lang="ts" >
    import LogInOutButton from '$lib/components/buttons/LogInOutButton.svelte';
</script>


<button class="pajamas--hamburger" aria-label="Menu Button"></button>
<h1 class="navbar__logo">Jurnl</h1>
<div class="navbar__links" id="navbar-links">
    <a href="/">Home</a>
    <a href="/landing">Landing</a>
    <a href="/journals">Journals</a>
    <a href="/feed">Friends' Feed</a>
</div>
<LogInOutButton />

