<script lang="ts">
    import EntrySidebar from '$lib/components/journal/EntrySidebar.svelte';
    import JournalsNav from '$lib/components/nav/JournalsNav.svelte';
    import type { LayoutProps } from './$types';

    let { data, children }: LayoutProps = $props();
    let showSidebar = $state(false);

    function toggleSidebar() {
        showSidebar = !showSidebar;
    }
</script>

<!--
Sidebar code written referencing team member Dillon's HW3 code:
https://github.com/4Clover/hw3-app/blob/b75d728cd6b5dddf95c3e6fbde131630041abea5/frontend/src/routes/%2Bpage.svelte#L552C5-L562C6
https://github.com/4Clover/hw3-app/blob/b75d728cd6b5dddf95c3e6fbde131630041abea5/frontend/src/routes/%2Bpage.svelte#L86
-->
<div class="journals-layout">
    <header>
        <nav class="navbar">
            <div class="navbar__container">
                <JournalsNav onSidebarToggleClick={toggleSidebar} />
            </div>
        </nav>
    </header>

    <main class="journals-layout__content">
        {@render children()}
    </main>
    {#if showSidebar}
        <div
            class="journals-layout__modal__overlay"
            aria-modal="true"
            role="dialog"
            onclick={toggleSidebar}
        >
            <section class="journals-layout__modal">
                <EntrySidebar />
            </section>
        </div>
    {/if}
</div>
