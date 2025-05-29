<script lang="ts">
    import type { PageProps } from './$types';
    import { enhance } from '$app/forms';

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
        <h2 class="center_item">Log In to View Your Journal</h2>
        <div class="center_item">
            <h4 class="label">Email Address</h4>
            <input class="fieldbox" bind:value={email} />
        </div>
        <div class="center_item">
            <h4 class="label">Password</h4>
            <input
                type="password"
                id="password"
                name="password"
                class="fieldbox"
                bind:value={password}
            />
        </div>
        {#if generalFormError}
            <div> Error: 
                <span class="block sm:inline">{generalFormError}</span>
            </div>
        {/if}
        <div class="center_item">
            <button class="primary-button button-sm"> Continue </button>
        </div>
    </div>
</main>
