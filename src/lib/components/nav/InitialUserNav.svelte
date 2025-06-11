<script lang="ts">
    import PrimaryButton from '../buttons/PrimaryButton.svelte';
</script>

<button onclick={() => (window.location.href = '/')}>
    <h1 class="navbar__logo">Jurnl</h1>
</button>
<!-- <div class="navbar__toggle" id="menu-toggle"></div> -->

<div class="navbar__links" id="navbar-links">
    <button
        onclick={() => (window.location.href = '/auth/login')}
        class="primary-button button-md"
    >
        <h3>Log In</h3>
    </button>
</div>
