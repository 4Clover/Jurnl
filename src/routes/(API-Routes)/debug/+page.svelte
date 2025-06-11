<script lang="ts">
    import { onMount } from 'svelte';

    let status = $state({
        test: { loading: true, ok: false, data: null },
        journals: { loading: true, ok: false, data: null },
        stats: { loading: true, ok: false, data: null },
        create: { loading: false, ok: false, data: null },
        seed: { loading: false, ok: false, data: null },
        clearSeed: { loading: false, ok: false, data: null },
    });

    async function checkEndpoint(name: keyof typeof status, url: string) {
        try {
            const res = await fetch(url);
            const data = await res.json();
            status[name] = {
                loading: false,
                ok: res.ok,
                data: res.ok
                    ? data
                    : `Error ${res.status}: ${data.message || 'Failed'}`,
            };
        } catch (err) {
            status[name] = {
                loading: false,
                ok: false,
                data: `Network error: ${err}` as any,
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
                    cover_color:
                        '#' + Math.floor(Math.random() * 16777215).toString(16),
                }),
            });
            const data = await res.json();
            status.create = {
                loading: false,
                ok: res.ok,
                data: res.ok ? data : `Error: ${data.message}`,
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

    async function seedTestData() {
        status.seed = { loading: true, ok: false, data: null };
        try {
            const res = await fetch('/api/dev/seed', {
                method: 'POST',
            });
            const data = await res.json();
            status.seed = {
                loading: false,
                ok: res.ok,
                data: res.ok ? data : `Error: ${data.message}`,
            };
        } catch (err) {
            status.seed = {
                loading: false,
                ok: false,
                data: `Error: ${err}` as any,
            };
        }
    }

    async function clearTestData() {
        status.clearSeed = { loading: true, ok: false, data: null };
        try {
            const res = await fetch('/api/dev/seed', {
                method: 'DELETE',
            });
            const data = await res.json();
            status.clearSeed = {
                loading: false,
                ok: res.ok,
                data: res.ok ? data : `Error: ${data.message}`,
            };
        } catch (err) {
            status.clearSeed = {
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

<div class="debug-container">
    <h1 class="debug-title">🚦 API Status Dashboard</h1>

    <div class="debug-grid">
        <!-- Test Route -->
        <div
            class="debug-status-card {status.test.loading
                ? 'loading'
                : status.test.ok
                  ? 'success'
                  : 'error'}"
        >
            <h2 class="debug-status-header">
                {#if status.test.loading}
                    ⏳
                {:else if status.test.ok}
                    ✅
                {:else}
                    ❌
                {/if}
                Test Route
                <code>/api/test</code>
            </h2>
            {#if !status.test.loading}
                <pre class="debug-pre">{JSON.stringify(
                        status.test.data,
                        null,
                        2,
                    )}</pre>
            {/if}
        </div>

        <!-- Journals -->
        <div
            class="debug-status-card {status.journals.loading
                ? 'loading'
                : status.journals.ok
                  ? 'success'
                  : 'error'}"
        >
            <h2 class="debug-status-header">
                {#if status.journals.loading}
                    ⏳
                {:else if status.journals.ok}
                    ✅
                {:else}
                    ❌
                {/if}
                List Journals
                <code>/api/journals</code>
            </h2>
            {#if !status.journals.loading}
                <pre class="debug-pre">{JSON.stringify(
                        status.journals.data,
                        null,
                        2,
                    )}</pre>
            {/if}
        </div>

        <!-- Stats -->
        <div
            class="debug-status-card {status.stats.loading
                ? 'loading'
                : status.stats.ok
                  ? 'success'
                  : 'error'}"
        >
            <h2 class="debug-status-header">
                {#if status.stats.loading}
                    ⏳
                {:else if status.stats.ok}
                    ✅
                {:else}
                    ❌
                {/if}
                Stats Endpoint
                <code>/api/stats</code>
            </h2>
            {#if !status.stats.loading}
                <pre class="debug-pre">{JSON.stringify(
                        status.stats.data,
                        null,
                        2,
                    )}</pre>
            {/if}
        </div>
    </div>

    <!-- Development Actions -->
    <div class="debug-actions">
        <h2>🔧 Development Actions</h2>

        <div class="debug-button-grid">
            <!-- Create Journal Test -->
            <button
                onclick={createJournal}
                disabled={status.create.loading}
                class="debug-button create"
            >
                {status.create.loading ? 'Creating...' : 'Create Test Journal'}
            </button>

            <!-- Seed Test Data -->
            <button
                onclick={seedTestData}
                disabled={status.seed.loading}
                class="debug-button seed"
            >
                {status.seed.loading ? 'Seeding...' : '🌱 Seed Test Users'}
            </button>

            <!-- Clear Test Data -->
            <button
                onclick={clearTestData}
                disabled={status.clearSeed.loading}
                class="debug-button clear"
            >
                {status.clearSeed.loading
                    ? 'Clearing...'
                    : '🧹 Clear Test Data'}
            </button>
        </div>

        <!-- Results Display -->
        {#if status.create.data || status.seed.data || status.clearSeed.data}
            <div class="debug-results">
                {#if status.create.data}
                    <div
                        class="debug-result-card {status.create.ok
                            ? 'success'
                            : 'error'}"
                    >
                        <strong>Create Journal Result:</strong>
                        <pre>{JSON.stringify(status.create.data, null, 2)}</pre>
                    </div>
                {/if}

                {#if status.seed.data}
                    <div
                        class="debug-result-card {status.seed.ok
                            ? 'success'
                            : 'error'}"
                    >
                        <strong>Seed Data Result:</strong>
                        <pre>{JSON.stringify(status.seed.data, null, 2)}</pre>
                    </div>
                {/if}

                {#if status.clearSeed.data}
                    <div
                        class="debug-result-card {status.clearSeed.ok
                            ? 'success'
                            : 'error'}"
                    >
                        <strong>Clear Data Result:</strong>
                        <pre>{JSON.stringify(
                                status.clearSeed.data,
                                null,
                                2,
                            )}</pre>
                    </div>
                {/if}
            </div>
        {/if}
    </div>

    <div class="debug-auth-status">
        <p>
            <strong>Auth Status:</strong>
            {#if status.journals.ok || status.test.ok || status.stats.ok}
                ✅ Authenticated (using bypass)
            {:else}
                ❌ Not authenticated
            {/if}
        </p>
    </div>

    <!-- Test Users Info -->
    <div class="debug-test-users">
        <h3>👥 Test Users for Friends Testing</h3>
        <p>
            Use the "Seed Test Users" button to create these test accounts with
            sample journals and entries:
        </p>
        <div class="debug-users-grid">
            <div class="debug-user-card">
                <strong>alice_writer</strong><br />
                <small>Alice Cooper</small><br />
                <em>Daily journaler ☕</em>
            </div>
            <div class="debug-user-card">
                <strong>bob_traveler</strong><br />
                <small>Bob the Explorer</small><br />
                <em>Adventure seeker 🌍</em>
            </div>
            <div class="debug-user-card">
                <strong>charlie_dev</strong><br />
                <small>Charlie Code</small><br />
                <em>Developer 💻</em>
            </div>
            <div class="debug-user-card">
                <strong>diana_artist</strong><br />
                <small>Diana Arts</small><br />
                <em>Creative soul 🎨</em>
            </div>
        </div>
        <p>
            <strong>Password for all test users:</strong>
            <code>testpass123</code>
        </p>
    </div>
</div>
