<script lang="ts" >
    import type {PageProps} from './$types';
    import {enhance} from '$app/forms';

    let { form, data }: PageProps = $props();

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
        <h2 class="center-item title">Log In to View Your Journal</h2>
        <div class="spacing"></div>

        <button onclick="/auth/google">Sign In with Google</button>

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
