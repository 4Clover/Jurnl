<script lang="ts" >
    import LogInOutButton from '$lib/components/buttons/LogInOutButton.svelte';
</script>


<button class="pajamas--hamburger" aria-label="Menu Button"></button>
<button onclick={() => (window.location.href = '/')}>
    <h1 class="navbar__logo">
        Jurnl
    </h1>
</button> 
<div class="navbar__links" id="navbar-links">
    <a href="/landing">Landing</a>
    <a href="/feed">Friends' Feed</a>
</div>
<LogInOutButton />

