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

<div
    class="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900"
>
    <div
        class="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800"
    >
        <h1
            class="mb-6 text-center text-3xl font-bold text-gray-800 dark:text-gray-100"
        >
            Create Account
        </h1>

        {#if generalFormError}
            <div
                class="relative mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
                role="alert"
            >
                <strong class="font-bold">Error:</strong>
                <span class="block sm:inline">{generalFormError}</span>
            </div>
        {/if}

        <form method="POST" use:enhance class="space-y-6">
            <div>
                <label
                    for="username"
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Username</label
                >
                <input
                    type="text"
                    id="username"
                    name="username"
                    bind:value={username}
                    required
                    minlength="3"
                    maxlength="30"
                    class="mt-1 block w-full rounded-md border px-3 py-2 placeholder-gray-400
                        shadow-sm focus:border-indigo-500 focus:ring-indigo-500
                        focus:outline-none sm:text-sm {usernameFieldError
                        ? 'border-red-500'
                        : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200'}"
                    aria-describedby={usernameFieldError
                        ? 'username-error'
                        : undefined}
                />
                {#if usernameFieldError}
                    <p
                        id="username-error"
                        class="mt-2 text-sm text-red-600 dark:text-red-400"
                    >
                        {usernameFieldError}
                    </p>
                {/if}
            </div>
            <div>
                <label
                    for="password"
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Password</label
                >
                <input
                    type="password"
                    id="password"
                    name="password"
                    bind:value={password}
                    required
                    minlength="8"
                    class="mt-1 block w-full rounded-md border px-3 py-2 placeholder-gray-400
                    shadow-sm focus:border-indigo-500 focus:ring-indigo-500
                    focus:outline-none sm:text-sm {passwordFieldError
                        ? 'border-red-500'
                        : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200'}"
                    aria-describedby={passwordFieldError
                        ? 'password-error'
                        : undefined}
                />
                {#if passwordFieldError}
                    <p
                        id="password-error"
                        class="mt-2 text-sm text-red-600 dark:text-red-400"
                    >
                        {passwordFieldError}
                    </p>
                {/if}
            </div>

            <div>
                <button
                    type="submit"
                    class="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-gray-800"
                >
                    Register
                </button>
            </div>
        </form>

        <p class="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?
            <a
                href="/auth/login"
                class="font-medium text-indigo-600 hover:text-indigo-500 dark:hover:text-indigo-400"
            >
                Log in
            </a>
        </p>
    </div>
</div>
