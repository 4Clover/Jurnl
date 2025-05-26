<script lang="ts">
    import '../app.css';
    import type { LayoutProps } from './$types';
    import { enhance } from '$app/forms';
    
    let { data, children } : LayoutProps = $props();
</script>
<main>
    <header>
        <nav>
            <a href="/">Home</a>
            {#if data.user}
                <span>Welcome, {data.user.username}!</span>
                <form method="POST" action="/auth/logout" use:enhance>
                    <button class="inline mix-blend-color=#FFFFF" type="submit">Logout</button>
                </form>
            {:else}
                <a href="/auth/login">Login</a>
            {/if}
        </nav>
    </header>
    {@render children()}
</main>
