<script lang="ts">
    import type { PageProps } from '../../register/$types';
    import { enhance } from '$app/forms';

    let { form }: PageProps = $props();

    // used for repopulating the form
    let username = $state(form?.data?.username ?? '');
    let password = $state('');

    // client side error showing
    const errors = $derived(
        form?.errors as
            | { username?: string; password?: string; form?: string }
            | undefined
    );
    const usernameFieldError = $derived(errors?.username);
    const passwordFieldError = $derived(errors?.password);
    const generalFormError = $derived(errors?.form);
</script>

<main class="center-container">
    <div class="login-box">
        <div class="spacing"></div>
        <div class="center-item title">
            <h2>Welcome to Jurnl!</h2>
            <h2>Let's get started.</h2>
        </div>
        <div class="spacing"></div>
        <!-- <div class="center-item">
            <h4 class="label">First Name</h4>
            <input class="fieldbox" bind:value={first} />
        </div>
        <div class="center-item">
            <h4 class="label">Last Name</h4>
            <input class="fieldbox" bind:value={last} />
        </div> -->

        {#if generalFormError}
            <div class="error-login" role="alert">
                <strong class="font-bold">Error:</strong>
                <span class="block sm:inline">{generalFormError}</span>
            </div>
        {/if}
        <form method="POST" use:enhance>
            <div class="center-item">
                <h4 class="label">Username</h4>
                <input
                    type="text"
                    id="username"
                    name="username"
                    bind:value={username}
                    required
                    minlength="3"
                    maxlength="30"
                    class="fieldbox"
                    aria-describedby={usernameFieldError
                        ? 'username-error'
                        : undefined}
                />
                {#if usernameFieldError}
                    <p id="username-error" class="error-login">
                        {usernameFieldError}
                    </p>
                {/if}
            </div>
            <div class="center-item">
                <h4 class="label">Password</h4>
                <input
                    type="password"
                    id="password"
                    name="password"
                    class="fieldbox"
                    bind:value={password}
                    required
                    minlength="8"
                    aria-describedby={passwordFieldError
                        ? 'password-error'
                        : undefined}
                />
                {#if passwordFieldError}
                    <p id="password-error" class="error-login">
                        {passwordFieldError}
                    </p>
                {/if}
            </div>
            <div class="center-item">
                <button type="submit" class="primary-button button-sm">
                    <h3>Register</h3>
                </button>
            </div>
        </form>
        <div class="center-item">
            <span class="aside">
                Already have an account? <a href="/auth/login"><u>Log In</u></a>
                instead!
            </span>
            <div class="spacing"></div>
        </div>
    </div>
</main>
