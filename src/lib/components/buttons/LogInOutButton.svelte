<script lang="ts">
    import { enhance } from '$app/forms';
    import { navigating, page } from '$app/state';
    import { invalidateAll } from '$app/navigation';

    // reactive states
    let isLoggingOut = $state(false);
    let isLoggedIn: boolean = $derived(!!page.data.user);
    // routes
    const logoutActionUrl: string = '/auth/logout';
    const loginPageUrl: string = 'auth/login';

    $effect(() => {
        console.log('LogInOutButton: page.data.user =', page.data.user);
        console.log('LogInOutButton: isLoggedIn =', isLoggedIn);
    });
</script>

<div>
    {#if isLoggedIn}
        <form
            method="POST"
            style="margin-right: 0"
            action={logoutActionUrl}
            use:enhance={() => {
                isLoggingOut = true;
                // callback runs after the server responds
                return async ({ update }) => {
                    try {
                        await update();
                        await invalidateAll();
                    } catch (e) {
                        console.error('Error during form', e);
                    } finally {
                        isLoggingOut = false;
                    }
                };
            }}
        >
            <button
                type="submit"
                class="logout-button logButton"
                disabled={isLoggingOut ||
                    (navigating &&
                        navigating.to?.url.pathname === logoutActionUrl)}
            >
                {#if isLoggingOut || (navigating && navigating.to?.url.pathname === logoutActionUrl)}
                    Logging out...
                {:else}
                    Log out
                {/if}
            </button>
        </form>
    {:else}
        <button type="button" class="primary-button button-md">
            <a href={loginPageUrl}> Log in </a>
        </button>
    {/if}
</div>
