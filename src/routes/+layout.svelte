<script lang="ts">
    import '../app.css';
    import type { LayoutProps } from './$types';
    import { enhance } from '$app/forms';
    import { redirect } from '@sveltejs/kit';
    let { data, children }: LayoutProps = $props();
</script>

<nav class="navbar">
    <div class="navbar__container">
        <button>
            <div class="pajamas--hamburger"></div>
        </button>
        <h1 class="navbar__logo">Jurnl</h1>
        <div class="navbar__toggle" id="menu-toggle"></div>
        <div class="navbar__links" id="navbar-links">
            <a href="/">Home</a>
            <a href="/auth/login">Login</a>
            <a href="/auth/register">Sign Up</a>
            <a href="/landing">Landing</a>
            <a href="/journals">Journals</a>
            <a href="/feed">Friends' Feed</a>
            <a href="/shared">Shared Journals</a>
        </div>
    </div>
</nav>

<main>
    {@render children()}
</main>
