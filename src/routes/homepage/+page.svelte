<script lang="ts">
    import type { PageProps } from './$types';
    let { data }: PageProps = $props();
</script>

<main class="center-container">
    {#if data.user}
        <h1 class="text-2xl font-bold">Dashboard</h1>
        <p class="mt-2">Hello, {data.user.username}!</p>
        <p class="mt-4">{data.dashboardData}</p>

        <div class="mt-6">
            <h2 class="text-xl font-semibold">Your Journals</h2>
            <p class="mt-2 text-gray-600">Journal listing will go here...</p>
            <a
                href="/journals/create"
                class="mt-2 inline-block rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                >Create New Journal</a
            >
        </div>
    {:else}
        <p>You need to be logged in to see the dashboard.</p>
    {/if}
</main>
