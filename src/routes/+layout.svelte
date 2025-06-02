<script lang="ts" >
    import '../app.css';
    import type {LayoutProps} from './$types';
    import NormalNav from '$lib/components/nav/NormalNav.svelte';
    import InitialUserNav from '$lib/components/nav/InitialUserNav.svelte';

    let { data, children }: LayoutProps = $props();
    let loggedIn = $derived(!!data.user);
</script>

<div class="layout">
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

    <main class="layout__content">
        {@render children()}
    </main>

    <footer class="layout__footer">
        <h1 class="title">
            Jurnl
        </h1>
        <div class="column">
            <h4 class="header">Jurnl</h4>
            <p class="item">FAQs</p>
            <p class="item">Support</p>
        </div>
        <div class="column">
            <h4 class="header">Logistics</h4>
            <p class="item">Terms and Condition</p>
            <p class="item">Privacy Policies</p>
        </div>
        
    </footer>
</div>
