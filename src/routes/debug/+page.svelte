<script lang="ts">
    import { onMount } from 'svelte';

    let status = $state({
        test: { loading: true, ok: false, data: null },
        journals: { loading: true, ok: false, data: null },
        stats: { loading: true, ok: false, data: null },
        create: { loading: false, ok: false, data: null }
    });

    async function checkEndpoint(name: keyof typeof status, url: string) {
        try {
            const res = await fetch(url);
            const data = await res.json();
            status[name] = {
                loading: false,
                ok: res.ok,
                data: res.ok ? data : `Error ${res.status}: ${data.message || 'Failed'}`
            };
        } catch (err) {
            status[name] = {
                loading: false,
                ok: false,
                data: `Network error: ${err}` as any
            };
        }
    }

    async function createJournal() {
        status.create = { loading: true, ok: false, data: null };
        try {
            const res = await fetch('/api/journals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: `Test Journal ${Date.now()}`,
                    cover_color: '#' + Math.floor(Math.random()*16777215).toString(16)
                })
            });
            const data = await res.json();
            status.create = {
                loading: false,
                ok: res.ok,
                data: res.ok ? data : `Error: ${data.message}`
            };
            // Refresh other endpoints
            await checkEndpoint('journals', '/api/journals');
            await checkEndpoint('stats', '/api/stats');
        } catch (err) {
            status.create = {
                loading: false,
                ok: false,
                data: `Error: ${err}` as any,
            };
        }
    }

    onMount(() => {
        checkEndpoint('test', '/api/test');
        checkEndpoint('journals', '/api/journals');
        checkEndpoint('stats', '/api/stats');
    });
</script>

<div style="padding: 2rem; max-width: 800px; margin: 0 auto; font-family: system-ui;">
    <h1 style="text-align: center; margin-bottom: 2rem;">🚦 API Status Dashboard</h1>
    
    <div style="display: grid; gap: 1rem;">
        <!-- Test Route -->
        <div style="
            padding: 1.5rem;
            border-radius: 8px;
            background: {status.test.loading ? '#fef3c7' : status.test.ok ? '#d1fae5' : '#fee2e2'};
            border: 2px solid {status.test.loading ? '#f59e0b' : status.test.ok ? '#10b981' : '#ef4444'};
        ">
            <h2 style="margin: 0 0 0.5rem 0; display: flex; align-items: center; gap: 0.5rem;">
                {#if status.test.loading}
                    ⏳
                {:else if status.test.ok}
                    ✅
                {:else}
                    ❌
                {/if}
                Test Route
                <code style="margin-left: auto; font-size: 0.875rem;">/api/test</code>
            </h2>
            {#if !status.test.loading}
                <pre style="margin: 0; font-size: 0.875rem; overflow-x: auto;">{JSON.stringify(status.test.data, null, 2)}</pre>
            {/if}
        </div>
        
        <!-- Journals -->
        <div style="
            padding: 1.5rem;
            border-radius: 8px;
            background: {status.journals.loading ? '#fef3c7' : status.journals.ok ? '#d1fae5' : '#fee2e2'};
            border: 2px solid {status.journals.loading ? '#f59e0b' : status.journals.ok ? '#10b981' : '#ef4444'};
        ">
            <h2 style="margin: 0 0 0.5rem 0; display: flex; align-items: center; gap: 0.5rem;">
                {#if status.journals.loading}
                    ⏳
                {:else if status.journals.ok}
                    ✅
                {:else}
                    ❌
                {/if}
                List Journals
                <code style="margin-left: auto; font-size: 0.875rem;">/api/journals</code>
            </h2>
            {#if !status.journals.loading}
                <pre style="margin: 0; font-size: 0.875rem; overflow-x: auto;">{JSON.stringify(status.journals.data, null, 2)}</pre>
            {/if}
        </div>
        
        <!-- Stats -->
        <div style="
            padding: 1.5rem;
            border-radius: 8px;
            background: {status.stats.loading ? '#fef3c7' : status.stats.ok ? '#d1fae5' : '#fee2e2'};
            border: 2px solid {status.stats.loading ? '#f59e0b' : status.stats.ok ? '#10b981' : '#ef4444'};
        ">
            <h2 style="margin: 0 0 0.5rem 0; display: flex; align-items: center; gap: 0.5rem;">
                {#if status.stats.loading}
                    ⏳
                {:else if status.stats.ok}
                    ✅
                {:else}
                    ❌
                {/if}
                Stats Endpoint
                <code style="margin-left: auto; font-size: 0.875rem;">/api/stats</code>
            </h2>
            {#if !status.stats.loading}
                <pre style="margin: 0; font-size: 0.875rem; overflow-x: auto;">{JSON.stringify(status.stats.data, null, 2)}</pre>
            {/if}
        </div>
    </div>
    
    <!-- Create Journal Test -->
    <div style="margin-top: 2rem; text-align: center;">
        <button
            on:click={createJournal}
            disabled={status.create.loading}
            style="
                padding: 1rem 2rem;
                background: #3b82f6;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 1rem;
                cursor: pointer;
                opacity: {status.create.loading ? 0.5 : 1};
            "
        >
            {status.create.loading ? 'Creating...' : 'Create Test Journal'}
        </button>
        
        {#if status.create.data}
            <div style="
                margin-top: 1rem;
                padding: 1rem;
                border-radius: 8px;
                background: {status.create.ok ? '#d1fae5' : '#fee2e2'};
                text-align: left;
            ">
                <strong>Create Result:</strong>
                <pre style="margin: 0.5rem 0 0 0; font-size: 0.875rem;">{JSON.stringify(status.create.data, null, 2)}</pre>
            </div>
        {/if}
    </div>
    
    <div style="
        margin-top: 2rem;
        padding: 1rem;
        background: #e0e7ff;
        border-radius: 8px;
        text-align: center;
    ">
        <p style="margin: 0;">
            <strong>Auth Status:</strong>
            {#if status.journals.ok || status.test.ok || status.stats.ok}
                ✅ Authenticated (using bypass)
            {:else}
                ❌ Not authenticated
            {/if}
        </p>
    </div>
</div>