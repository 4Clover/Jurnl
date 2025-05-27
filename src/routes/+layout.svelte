<script lang="ts">
    import '../app.css';
    import type { LayoutProps } from './$types';
    import { enhance } from '$app/forms';
    import { redirect } from '@sveltejs/kit';
    let { data, children }: LayoutProps = $props();
</script>

<main>
    <header>
        <nav>
            <a href="/">Home</a>
            {#if data.user}
                <span>Welcome, {data.user.username}!</span>
                <form method="POST" action="/auth/logout">
                    <button class="hover:contrast-less: border">Logout</button>
                </form>
            {:else}
                <a class="hover:contrast-less: border" href="/auth/login"
                    >Login</a
                >
            {/if}
        </nav>
    </header>
    {@render children()}
</main>
