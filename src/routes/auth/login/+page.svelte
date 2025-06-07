<script lang="ts">
    import type { PageProps } from './$types';
    import { enhance } from '$app/forms';
    import {goto} from "$app/navigation";

    let { form, data }: PageProps = $props();

    // used for repopulating the form
    let username = $state(form?.data?.username ?? '');
    let password = $state('');

    // client side error showing
    const errors = $derived(
        form?.errors as
            | { username?: string; password?: string; form?: string }
            | undefined,
    );
    const usernameFieldError = $derived(errors?.username);
    const passwordFieldError = $derived(errors?.password);
    const generalFormError = $derived(errors?.form);
</script>

<main class="center-container">
    <div class="login-box">
        <div class="spacing"></div>
        <h2 class="center-item title">Log In to View Your Journal</h2>
        <div class="spacing"></div>
        
        <div class="center-item" style="margin-bottom: 20px;">
            <a href="/auth/login/google" class="google-login-button button-sm">
                <img src="/google-logo.svg.webp" alt="Google logo" style="height: 20px; margin-right: 10px; vertical-align: middle;" />
                Sign in with Google
            </a>
        </div>
        
        <div class="center-item" style="margin-bottom: 15px;">
            <span class="aside">Or continue with username/password</span>
        </div>
        
        {#if generalFormError}
            <div>
                Error:
                <span class="block sm:inline">{generalFormError}</span>
            </div>
        {/if}
        <form
            method="POST"
            use:enhance={() => {
                return async ({ update }) => {
                    await update();
                };
            }}
        >
            {#if data.redirectTo}
                <input
                    type="hidden"
                    name="redirectTo"
                    value={data.redirectTo}
                />
            {/if}

            <div class="center-item">
                <h4 class="label">Username</h4>
                <input
                    type="text"
                    id="username"
                    name="username"
                    class="fieldbox"
                    bind:value={username}
                    required
                    aria-describedby={usernameFieldError
                        ? 'username-error'
                        : undefined}
                />
                <!-- figure out how to make it red if wrong -->
                {#if usernameFieldError}
                    <p id="username-error" class="error-text">
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
                    aria-describedby={passwordFieldError
                        ? 'password-error'
                        : undefined}
                />
                {#if passwordFieldError}
                    <p id="password-error" class="error-text">
                        {passwordFieldError}
                    </p>
                {/if}
            </div>
            <div class="center-item">
                <button type="submit" class="primary-button button-sm">
                    <h3>Log In</h3>
                </button>
            </div>
        </form>
        <div class="center-item">
            <span class="aside">
                Don't have an account yet? <a href="/auth/register"
                    ><u>Sign Up</u></a
                > instead!
            </span>
            <div class="spacing"></div>
        </div>
    </div>
</main>

<style>
    .google-login-button {
        background-color: #ffffff; /* Google's white */
        color: #4285F4; /* Google's blue for text */
        border: 1px solid #dadce0; /* Subtle border */
        box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15);
        width: calc(100% - 20px); /* Match fieldbox width slightly less due to padding */
        max-width: 300px;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }
    .google-login-button:hover {
        background-color: #f8f9fa;
        border-color: #c6c6c6;
    }
</style>
