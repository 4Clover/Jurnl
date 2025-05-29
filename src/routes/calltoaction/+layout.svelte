<script lang="ts">
    import type { LayoutProps } from './$types';
    import { enhance } from '$app/forms';
    import { redirect } from '@sveltejs/kit';
    let { data, children }: LayoutProps = $props();
</script>

<nav class="navbar">
    <div class="navbar__container">
        <!-- <button>
            <div class="pajamas--hamburger"></div>
        </button> -->
        <h1 class="navbar__logo">Jurnl</h1>
        <!-- <div class="navbar__toggle" id="menu-toggle"></div> -->

        <div class="navbar__links" id="navbar-links">
            
            <button class="primary-button button-sm">
                <h3>Log In</h3>
            </button>
            <button class="secondary-button button-sm">
                <h3>Sign Up</h3>
            </button>
        </div>

    </div>
</nav>

<main>
    {@render children()}
</main>
