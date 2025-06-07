<script>
    import SidebarToggle from '../buttons/SidebarToggle.svelte';

    let { onSidebarToggleClick } = $props();
</script>

<SidebarToggle {onSidebarToggleClick} />
<button onclick={() => (window.location.href = '/')}>
    <h1 class="navbar__logo">Jurnl</h1>
</button>
