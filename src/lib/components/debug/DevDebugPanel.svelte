<style>
    /* Component-scoped CSS variables */
    .debug-trigger,
    .debug-panel,
    .debug-overlay {
        --olive: #4a571a;
        --sage: #999f85;
        --beige: #e1d4cb;
        --off-white: #fdfff4;
        --brown: #715138;
    }

    .debug-trigger {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: var(--olive, #4a571a);
        color: var(--off-white, #fdfff4);
        border: 3px solid var(--off-white, #fdfff4);
        font-size: 24px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 9998;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: inherit;
    }

    .debug-trigger:hover:not(:disabled) {
        transform: scale(1.05);
        border-color: var(--sage, #999f85);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
    }

    .debug-trigger:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .loading-spinner {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }

    .debug-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    .debug-panel {
        background: var(--off-white, #fdfff4);
        border-radius: 12px;
        width: 90vw;
        max-width: 800px;
        max-height: 90vh;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: slideIn 0.3s ease-out;
        font-family: inherit;
        display: flex;
        flex-direction: column;
        border: 3px solid var(--sage, #999f85);
    }

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
    }

    .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        background: var(--olive, #4a571a);
        color: var(--off-white, #fdfff4);
        border-radius: 8px 8px 0 0;
        flex-shrink: 0;
    }

    .panel-header h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
    }

    .close-btn {
        background: transparent;
        border: 2px solid var(--off-white, #fdfff4);
        color: var(--off-white, #fdfff4);
        border-radius: 6px;
        width: 36px;
        height: 36px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        font-size: 16px;
    }

    .close-btn:hover {
        background: var(--off-white, #fdfff4);
        color: var(--olive, #4a571a);
    }

    .panel-content {
        padding: 24px;
        overflow-y: auto;
        flex: 1;
    }

    .main-actions {
        display: flex;
        gap: 16px;
        margin-bottom: 24px;
        flex-wrap: wrap;
    }

    .primary-action-btn {
        background: var(--olive, #4a571a);
        color: var(--off-white, #fdfff4);
        border: 3px solid var(--off-white, #fdfff4);
        padding: 12px 24px;
        border-radius: 6px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        flex: 1;
        min-width: 200px;
    }

    .primary-action-btn:hover:not(:disabled) {
        border-color: var(--sage, #999f85);
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    .primary-action-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .secondary-action-btn {
        background: var(--off-white, #fdfff4);
        color: var(--olive, #4a571a);
        border: 3px solid var(--sage, #999f85);
        padding: 12px 24px;
        border-radius: 6px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
    }

    .secondary-action-btn:hover:not(:disabled) {
        border-color: var(--olive, #4a571a);
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    .secondary-action-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .test-summary {
        margin-bottom: 24px;
        padding: 20px;
        background: var(--beige, #e1d4cb);
        border-radius: 8px;
        border: 2px solid var(--sage, #999f85);
    }

    .test-summary h3 {
        margin: 0 0 16px 0;
        color: var(--brown, #715138);
        font-size: 1.2rem;
    }

    .summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 12px;
        margin-bottom: 16px;
    }

    .summary-card {
        background: var(--off-white, #fdfff4);
        padding: 12px;
        border-radius: 6px;
        text-align: center;
        border: 2px solid var(--sage, #999f85);
    }

    .summary-card.success {
        border-color: #22c55e;
        background: #f0fdf4;
    }

    .summary-card.error {
        border-color: #ef4444;
        background: #fef2f2;
    }

    .summary-label {
        font-size: 12px;
        color: var(--brown, #715138);
        margin-bottom: 4px;
    }

    .summary-value {
        font-size: 20px;
        font-weight: 700;
        color: var(--olive, #4a571a);
    }

    .summary-card.success .summary-value {
        color: #16a34a;
    }

    .summary-card.error .summary-value {
        color: #dc2626;
    }

    .seed-info {
        background: var(--off-white, #fdfff4);
        padding: 12px;
        border-radius: 6px;
        border: 2px solid var(--sage, #999f85);
    }

    .seed-info p {
        margin: 4px 0;
        font-size: 14px;
        color: var(--brown, #715138);
    }

    .seed-info code {
        background: var(--beige, #e1d4cb);
        padding: 2px 6px;
        border-radius: 3px;
        font-weight: 600;
        color: var(--olive, #4a571a);
    }

    .test-results {
        margin-bottom: 24px;
    }

    .test-results h3 {
        margin: 0 0 12px 0;
        color: var(--brown, #715138);
        font-size: 1.2rem;
    }

    .results-list {
        max-height: 300px;
        overflow-y: auto;
        border: 2px solid var(--sage, #999f85);
        border-radius: 6px;
        background: var(--off-white, #fdfff4);
    }

    .result-item {
        padding: 12px 16px;
        border-bottom: 1px solid var(--beige, #e1d4cb);
    }

    .result-item:last-child {
        border-bottom: none;
    }

    .result-item.success {
        background: #f0fdf4;
    }

    .result-item.error {
        background: #fef2f2;
    }

    .result-header {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .result-icon {
        font-size: 16px;
        width: 20px;
    }

    .result-name {
        flex: 1;
        font-weight: 600;
        color: var(--brown, #715138);
    }

    .result-timing {
        font-size: 12px;
        color: var(--olive, #4a571a);
        background: var(--beige, #e1d4cb);
        padding: 2px 6px;
        border-radius: 3px;
    }

    .result-error {
        margin-top: 8px;
        padding: 8px;
        background: #fee2e2;
        border-radius: 4px;
        font-size: 12px;
        color: #dc2626;
        font-family: monospace;
    }

    .test-users-info h3 {
        margin: 0 0 12px 0;
        color: var(--brown, #715138);
        font-size: 1.2rem;
    }

    .test-users-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 8px;
    }

    .test-user {
        background: var(--beige, #e1d4cb);
        padding: 12px;
        border-radius: 6px;
        border: 2px solid var(--sage, #999f85);
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .test-user strong {
        color: var(--olive, #4a571a);
        font-size: 14px;
    }

    .test-user span {
        color: var(--brown, #715138);
        font-size: 12px;
    }

    @media (max-width: 768px) {
        .debug-panel {
            width: 100vw;
            height: 100vh;
            border-radius: 0;
            max-height: 100vh;
        }

        .debug-trigger {
            bottom: 16px;
            right: 16px;
            width: 50px;
            height: 50px;
            font-size: 20px;
        }

        .main-actions {
            flex-direction: column;
        }

        .summary-grid {
            grid-template-columns: repeat(2, 1fr);
        }

        .test-users-grid {
            grid-template-columns: 1fr;
        }
    }
</style>

<script lang="ts">
    import { dev, browser } from '$app/environment';
    import { onMount } from 'svelte';

    // Check if we're in development mode using multiple methods
    let shouldRender = $state(false);

    let isOpen = $state(false);
    let isLoading = $state(false);
    interface TestResult {
        name: string;
        url: string;
        method: string;
        status: number;
        ok: boolean;
        timing: number;
        data: unknown;
        timestamp: string;
    }

    interface SeedResult {
        success: boolean;
        message: string;
        users: string[];
        friendsAdded: boolean;
        sharedEntriesCreated: boolean;
    }

    let testResults = $state<TestResult[]>([]);
    let lastTestSummary = $state<{
        totalTests: number;
        successful: number;
        failed: number;
        avgTime: number;
        seedResult?: SeedResult;
    } | null>(null);

    async function runFullSystemTest() {
        if (isLoading) return;

        isLoading = true;
        testResults = [];

        const tests = [
            { name: 'API Health Check', url: '/api/test', method: 'GET' },
            { name: 'Database Stats', url: '/api/stats', method: 'GET' },
            {
                name: 'Seed Test Users & Friends',
                url: '/api/dev/seed',
                method: 'POST',
            },
            { name: 'List Journals', url: '/api/journals', method: 'GET' },
            {
                name: 'List Journals with Entries',
                url: '/api/journals?withEntries=true',
                method: 'GET',
            },
            {
                name: 'Get Friends Usernames',
                url: '/api/friends',
                method: 'GET',
            },
            {
                name: 'Get Friends Public Entries',
                url: '/api/friends/entries',
                method: 'GET',
            },
            { name: 'Final Stats Check', url: '/api/stats', method: 'GET' },
        ];

        let seedResult = null;

        for (const test of tests) {
            const testStartTime = performance.now();

            try {
                const options: RequestInit = {
                    method: test.method,
                    headers: { 'Content-Type': 'application/json' },
                };

                const res = await fetch(test.url, options);
                const timing = Math.round(performance.now() - testStartTime);

                let data: unknown;
                try {
                    data = (await res.json()) as unknown;
                } catch {
                    data = await res.text();
                }

                const result: TestResult = {
                    name: test.name,
                    url: test.url,
                    method: test.method,
                    status: res.status,
                    ok: res.ok,
                    timing,
                    data: res.ok
                        ? data
                        : `Error ${res.status}: ${(data as { message?: string })?.message || String(data) || 'Failed'}`,
                    timestamp: new Date().toISOString(),
                };

                testResults.push(result);

                if (test.name === 'Seed Test Users & Friends' && res.ok) {
                    seedResult = data as SeedResult;
                }
            } catch (err) {
                const timing = Math.round(performance.now() - testStartTime);
                testResults.push({
                    name: test.name,
                    url: test.url,
                    method: test.method,
                    status: 0,
                    ok: false,
                    timing,
                    data: `Network error: ${String(err)}`,
                    timestamp: new Date().toISOString(),
                });
            }
        }

        const successful = testResults.filter((r) => r.ok).length;
        const failed = testResults.filter((r) => !r.ok).length;
        const avgTime = Math.round(
            testResults.reduce((acc, r) => acc + r.timing, 0) /
                testResults.length,
        );

        lastTestSummary = {
            totalTests: testResults.length,
            successful,
            failed,
            avgTime,
            seedResult: seedResult || undefined,
        };

        isLoading = false;
    }

    async function clearTestData() {
        if (isLoading) return;

        isLoading = true;

        try {
            const res = await fetch('/api/dev/seed', { method: 'DELETE' });
            await res.json();

            if (res.ok) {
                // stats check AFTER clearing
                await fetch('/api/stats').then((r) => r.json());
                lastTestSummary = null;
                testResults = [];
            }
        } catch (err) {
            console.error('Failed to clear test data:', err);
        }

        isLoading = false;
    }

    function togglePanel() {
        isOpen = !isOpen;
    }

    function closePanel() {
        isOpen = false;
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape' && isOpen) {
            closePanel();
        }
    }

    onMount(() => {
        // Check multiple indicators for development mode
        const isDevMode =
            dev === true ||
            import.meta.env.DEV === true ||
            import.meta.env.MODE === 'development' ||
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1';

        console.log('DevDebugPanel mounted:', {
            dev,
            browser,
            'import.meta.env.DEV': import.meta.env.DEV,
            'import.meta.env.MODE': import.meta.env.MODE,
            hostname: window.location.hostname,
            isDevMode,
        });

        // Only render in browser and dev mode
        shouldRender = browser && isDevMode;

        document.addEventListener('keydown', handleKeydown);
        return () => {
            console.log('DevDebugPanel unmounting');
            document.removeEventListener('keydown', handleKeydown);
        };
    });
</script>

{#if shouldRender}
    <!-- Debug Trigger Button -->
    <button
        class="debug-trigger"
        onclick={togglePanel}
        title="Open Debug Panel (Dev Mode)"
        disabled={isLoading}
    >
        {#if isLoading}
            <span class="loading-spinner">⏳</span>
        {:else}
            🧪
        {/if}
    </button>

    <!-- Debug Panel Modal -->
    {#if isOpen}
        <div
            class="debug-overlay"
            onclick={closePanel}
            onkeydown={(e) => e.key === 'Enter' && closePanel()}
            role="button"
            tabindex="0"
        >
            <div
                class="debug-panel"
                onclick={(e) => e.stopPropagation()}
                onkeydown={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                tabindex="-1"
            >
                <!-- Header -->
                <div class="panel-header">
                    <h2>🧪 Development Tools</h2>
                    <button
                        class="close-btn"
                        onclick={closePanel}
                        title="Close (Esc)"
                    >
                        ✕
                    </button>
                </div>

                <!-- Main Actions -->
                <div class="panel-content">
                    <div class="main-actions">
                        <button
                            class="primary-action-btn"
                            onclick={runFullSystemTest}
                            disabled={isLoading}
                        >
                            {#if isLoading}
                                ⏳ Running Tests...
                            {:else}
                                🚀 Setup & Test All APIs
                            {/if}
                        </button>

                        <button
                            class="secondary-action-btn"
                            onclick={clearTestData}
                            disabled={isLoading}
                        >
                            🧹 Clear Test Data
                        </button>
                    </div>

                    <!-- Test Summary -->
                    {#if lastTestSummary}
                        <div class="test-summary">
                            <h3>📊 Last Test Results</h3>
                            <div class="summary-grid">
                                <div class="summary-card">
                                    <div class="summary-label">Total Tests</div>
                                    <div class="summary-value">
                                        {lastTestSummary.totalTests}
                                    </div>
                                </div>
                                <div class="summary-card success">
                                    <div class="summary-label">Successful</div>
                                    <div class="summary-value">
                                        {lastTestSummary.successful}
                                    </div>
                                </div>
                                <div
                                    class="summary-card {lastTestSummary.failed >
                                    0
                                        ? 'error'
                                        : ''}"
                                >
                                    <div class="summary-label">Failed</div>
                                    <div class="summary-value">
                                        {lastTestSummary.failed}
                                    </div>
                                </div>
                                <div class="summary-card">
                                    <div class="summary-label">Avg Time</div>
                                    <div class="summary-value">
                                        {lastTestSummary.avgTime}ms
                                    </div>
                                </div>
                            </div>

                            {#if lastTestSummary.seedResult && lastTestSummary.seedResult.friendsAdded}
                                <div class="seed-info">
                                    <p>
                                        ✅ Test users created and added as
                                        friends
                                    </p>
                                    <p>
                                        📰 Shared journal entries created for
                                        feed testing
                                    </p>
                                    <p>
                                        🔑 Test users use Google OAuth authentication
                                    </p>
                                </div>
                            {/if}
                        </div>
                    {/if}

                    <!-- Recent Test Results -->
                    {#if testResults.length > 0}
                        <div class="test-results">
                            <h3>🔍 Detailed Results</h3>
                            <div class="results-list">
                                {#each testResults as result, index (index)}
                                    <div
                                        class="result-item {result.ok
                                            ? 'success'
                                            : 'error'}"
                                    >
                                        <div class="result-header">
                                            <span class="result-icon">
                                                {result.ok ? '✅' : '❌'}
                                            </span>
                                            <span class="result-name"
                                                >{result.name}</span
                                            >
                                            <span class="result-timing"
                                                >{result.timing}ms</span
                                            >
                                        </div>
                                        {#if !result.ok}
                                            <div class="result-error">
                                                {String(result.data)}
                                            </div>
                                        {/if}
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/if}

                    <!-- Test Users Info -->
                    <div class="test-users-info">
                        <h3>👥 Available Test Users</h3>
                        <div class="test-users-grid">
                            <div class="test-user">
                                <strong>alice_writer</strong>
                                <span>Alice Cooper</span>
                            </div>
                            <div class="test-user">
                                <strong>bob_traveler</strong>
                                <span>Bob the Explorer</span>
                            </div>
                            <div class="test-user">
                                <strong>charlie_dev</strong>
                                <span>Charlie Code</span>
                            </div>
                            <div class="test-user">
                                <strong>diana_artist</strong>
                                <span>Diana Arts</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    {/if}
{/if}
