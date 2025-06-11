<style>
    .page-container {
        min-height: 100vh;
        background: #f9fafb;
        padding-bottom: 4rem;
    }

    .page-header {
        background: white;
        border-bottom: 1px solid #e5e7eb;
        padding: 1rem 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
    }

    main {
        padding: 0 2rem;
    }
</style>

<script lang="ts">
    import EntryView from '$components/entry/EntryView.svelte';
    import { goto } from '$app/navigation';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>

<div class="page-container">
    <header class="page-header">
        <button
            class="addfriend-button button-sm"
            onclick={() =>
                (window.location.href = '/feed/' + 'USERID' + data.entry.user)}
        >
            <h3>Back To Feed</h3>
        </button>
    </header>
    <main>
        <EntryView entry={data.entry} />
    </main>
</div>
