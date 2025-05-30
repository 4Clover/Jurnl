<script lang="ts" >
    import '../app.css';
    import type {LayoutProps} from './$types';
    import NormalNav from '$lib/components/nav/NormalNav.svelte';
    import InitialUserNav from '$lib/components/nav/InitialUserNav.svelte';

    let { data, children }: LayoutProps = $props();
    let loggedIn = $derived(!!data.user);
</script>

<header>
    <nav class="navbar">
        <div class="navbar__container">
            {#if loggedIn}
                <NormalNav />
            {:else}
                <InitialUserNav />
            {/if}
        </div>
    </nav>
</header>

<main>
    {@render children()}
</main>
