<script lang="ts">
    import EntrySidebar from '$lib/components/journal/EntrySidebar.svelte';
    import JournalsNav from '$lib/components/nav/JournalsNav.svelte';
    import type { LayoutProps } from './$types';

    let { data, children }: LayoutProps = $props();
    let showSidebar = $state(true);
</script>

<section class="journals-layout__modal">
    {#if showSidebar}
        <EntrySidebar />
    {/if}
</section>
<div class="journals-layout">
    <header>
        <nav class="navbar">
            <div class="navbar__container">
                <JournalsNav />
            </div>
        </nav>
    </header>

    <main class="journals-layout__content">
        {@render children()}
    </main>
</div>
