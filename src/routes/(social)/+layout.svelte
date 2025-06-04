<script lang="ts">
    import '../../app.css';
    import NormalNav from '$lib/components/nav/NormalNav.svelte';
    import type { LayoutProps } from './$types';

    let { children }: LayoutProps = $props();
</script>

<div class="layout">
    <header>
        <nav class="navbar">
            <div class="navbar__container">
                <NormalNav />
            </div>
        </nav>
    </header>
    <main class="layout__content">
        {@render children()}
    </main>

    <footer class="layout__footer">
        <h1 class="title">Jurnl</h1>
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
