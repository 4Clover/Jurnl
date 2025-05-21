# SvelteKit Quick Start for Svelte Developers

SvelteKit builds upon Svelte by providing a powerful, opinionated framework for building full-stack web applications with features like routing, server-side rendering (SSR), server-side logic, and data loading.

This guide will focus on the key SvelteKit concepts and file structures you'll encounter while building our journaling app.

## Table of Contents

1.  [From Svelte to SvelteKit: The Big Picture](#from-svelte-to-sveltekit-the-big-picture)
2.  [Project Structure Overview](#project-structure-overview)
3.  [Routing in SvelteKit](#routing-in-sveltekit)
    - [Pages (`+page.svelte`)](#pages-pagesvelte)
    - [Layouts (`+layout.svelte`)](#layouts-layoutsvelte)
    - [Route Parameters (Dynamic Routes)](#route-parameters-dynamic-routes)
4.  [Loading Data (`+page.server.ts` - `load` function)](#loading-data-pageserverts---load-function)
5.  [Handling Form Submissions & Mutations (`+page.server.ts` - `actions`)](#handling-form-submissions--mutations-pageserverts---actions)
6.  [API Endpoints (`+server.ts`)](#api-endpoints-serverts)
7.  [Server-Only Code (`src/lib/server/`)](#server-only-code-srclibserver)
8.  [Shared Code (`src/lib/`)](#shared-code-srclib)
9.  [Environment Variables](#environment-variables)
10. [Key SvelteKit Globals & Types](#key-sveltekit-globals--types)
11. [Building & Adapters](#building--adapters)
12. [Tips for Svelte Developers New to SvelteKit](#tips-for-svelte-developers-new-to-sveltekit)

---

## 1. From Svelte to SvelteKit: The Big Picture

Think of SvelteKit as the application framework _around_ your Svelte components. While Svelte gives you a great way to build UI components, SvelteKit handles:

- **Routing:** How URLs map to your Svelte components.
- **Server-Side Rendering (SSR):** Rendering pages on the server for faster initial loads and SEO.
- **Data Loading:** Fetching data for your pages before they render (can be server-side or client-side).
- **Form Handling:** Processing form submissions on the server.
- **API Routes:** Creating backend API endpoints.
- **Build Optimization:** Creating highly optimized production builds.

You'll still write Svelte components just like you're used to, but SvelteKit provides conventions for how these components form pages and interact with server-side logic.

## 2. Project Structure Overview

When you create a SvelteKit project (e.g., with `npm create svelte@latest`), you'll see a structure like this:

```
ScribblyScraps/
├── .svelte-kit/        # Generated files, don't touch directly (usually gitignored)
├── node_modules/       # Project dependencies
├── src/
│   ├── app.html        # The HTML shell for your application
│   ├── app.d.ts        # TypeScript declarations for SvelteKit types
│   ├── hooks.server.ts # Server-side hooks (e.g., for auth middleware)
│   ├── hooks.client.ts # Client-side hooks (less common)
│   ├── lib/            # Your shared Svelte components, utilities, stores
│   │   ├── components/ # Example: Reusable UI components
│   │   ├── server/     # Modules that ONLY run on the server (e.g., database logic)
│   │   └── utils/      # Example: Shared utility functions
│   └── routes/         # **KEY FOLDER: Defines your application's pages and API endpoints**
│       └── +page.svelte  # The Svelte component for the homepage (/)
├── static/             # Static assets (images, fonts) that are copied as-is
├── svelte.config.js    # SvelteKit and Vite configuration
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite specific configuration (often minimal for SvelteKit)
├── package.json
└── README.md
```

- **`src/routes/`**: This is where most of your application-specific SvelteKit work will happen.
- **`src/lib/`**: For reusable code. Code in `src/lib/server/` is guaranteed to only run on the server.

## 3. Routing in SvelteKit

SvelteKit uses a **file-system-based router**. This means the structure of your `src/routes/` directory defines the URLs of your application.

### Pages (`+page.svelte`)

- To create a page, create a file named `+page.svelte` inside a directory in `src/routes/`.
- **Example:**
    - `src/routes/+page.svelte` -> corresponds to the URL `/` (homepage)
    - `src/routes/about/+page.svelte` -> corresponds to the URL `/about`
    - `src/routes/journal/new/+page.svelte` -> corresponds to `/journal/new`

These are regular Svelte components that will be rendered for that route.

### Layouts (`+layout.svelte`)

- Layouts allow you to share UI elements (like headers, footers, navigation bars) across multiple pages within a directory and its subdirectories.
- Create a `+layout.svelte` file in a directory. It will wrap all `+page.svelte` files in that directory and its children.
- Layouts _must_ include a `<slot />` component where the child layout or page content will be injected.
- **Example (`src/routes/+layout.svelte` - Root Layout):**

    ```sveltehtml
    <script lang="ts">
      import Navbar from '$lib/components/Navbar.svelte';
      import Footer from '$lib/components/Footer.svelte';
    </script>

    <Navbar />

    <main>
      <slot /> <!-- Page content goes here -->
    </main>

    <Footer />
    ```

- You can have nested layouts. For instance, `src/routes/dashboard/+layout.svelte` would apply to all pages under `/dashboard/*` and would itself be wrapped by the root layout.

### Route Parameters (Dynamic Routes)

- To create routes with dynamic segments (e.g., `/journal/[entryId]`), use square brackets `[]` in your directory names.
- **Example:** `src/routes/journal/[entryId]/+page.svelte`
    - This will match URLs like `/journal/123`, `/journal/abc`.
    - The value of `entryId` (e.g., "123") will be available as a parameter in your `load` function (see next section) and sometimes directly in the page component via `$page.params`.

## 4. Loading Data (`+page.server.ts` - `load` function)

Often, your pages need data from a server (like our MongoDB database) before they can render. SvelteKit provides a `load` function for this.

- Create a `+page.server.ts` (or `.js`) file in the same directory as your `+page.svelte`.
- Export an **async `load` function** from this file.
- This function runs **on the server** before the page is rendered (during SSR or navigation).
- It can fetch data, process it, and return it. The returned data is automatically made available to the corresponding `+page.svelte` component as a prop called `data`.
- **Example (`src/routes/journal/[entryId]/+page.server.ts`):**

    ```typescript
    // src/routes/journal/[entryId]/+page.server.ts
    import type { PageServerLoad } from './$types';
    import { db } from '$lib/server/database'; // Your database connection
    import { error } from '@sveltejs/kit';

    export const load: PageServerLoad = async ({ params, locals }) => {
        // `params` contains route parameters, e.g., params.entryId
        // `locals` can hold per-request data, like authenticated user (from hooks)
        console.log('Loading entry for ID:', params.entryId);
        console.log('Authenticated user (from locals):', locals.user);

        const entry = await db.collection('entries').findOne({
            _id: params.entryId,
            userId: locals.user?.id, // Ensure user can only access their own entries
        });

        if (!entry) {
            error(404, 'Journal entry not found');
        }

        return {
            entry: {
                // This object will be `data.entry` in +page.svelte
                id: entry._id.toString(),
                title: entry.title,
                content: entry.content,
                // ... other serializable fields
            },
        };
    };
    ```

- **In `+page.svelte`:**

    ```sveltehtml
    <script lang="ts">
      import type { PageData } from './$types';
      // `data` is typed from the load function's return.
      // PageData is the type of the `data` object itself.
      let data : { data: PageData } = $props();
    </script>

    <h1>{data.entry.title}</h1>
    <div>{@html data.entry.content}</div>
    ```

- `load` functions can also exist in `+layout.server.ts` to load data for layouts, which then becomes available to all child pages.

## 5. Handling Form Submissions & Mutations (`+page.server.ts` - `actions`)

For handling form submissions (POST, PUT, DELETE requests) that modify data, SvelteKit uses **`actions`**.

- In your `+page.server.ts` file, export an object named `actions`.
- Each key in this object is the name of an action and corresponds to a function that handles the request.
- These functions run **on the server**.
- **Example (`src/routes/journal/new/+page.server.ts`):**

    ```typescript
    import type { Actions, PageServerLoad } from './$types';
    import { db } from '$lib/server/database';
    import { redirect, fail } from '@sveltejs/kit';

    // Optional: load function if this page needs initial data
    export const load: PageServerLoad = async ({ locals }) => {
        if (!locals.user) {
            redirect(303, '/login'); // Protect this page
        }
        return {};
    };

    export const actions: Actions = {
        default: async ({ request, locals }) => {
            // 'default' action for simple forms
            if (!locals.user) {
                return fail(401, { message: 'Not authenticated' });
            }

            const formData = await request.formData();
            const title = formData.get('title') as string;
            const content = formData.get('content') as string;

            if (!title || !content) {
                return fail(400, {
                    title,
                    content,
                    message: 'Title and content are required.',
                });
            }

            try {
                const result = await db.collection('entries').insertOne({
                    title,
                    content,
                    userId: locals.user.id,
                    createdAt: new Date(),
                });
                // Redirect to the new entry or another page
                redirect(303, `/journal/${result.insertedId.toString()}`);
            } catch (err) {
                console.error('Error saving entry:', err);
                return fail(500, { message: 'Failed to save entry.' });
            }
        },
        // You can have named actions:
        // updateTitle: async ({ request }) => { /* ... */ }
    };
    ```

- **In `+page.svelte` (the form):**

```sveltehtml
<script lang="ts">
    import type { ActionData } from './$types';

    interface JournalEntryForm {
		    title: string;
		    content: string;
		    message?: string;
    }

    const FORM_LABELS = {
		    TITLE: 'Title:',
		    CONTENT: 'Content:',
		    SUBMIT: 'Save Entry'
    };

    // `form` contains data returned from a failed action and can be undefined initially.
    // ActionData is the type of the `form` object itself when present.
    let form : { form?: ActionData } = $props();

    // Use $state for two-way binding with form inputs
    let journalEntry = $state({
		    title: form?.title ?? '',
		    content: form?.content ?? ''
    });

    // Effect to update local state if the `form` prop changes (e.g., after server validation)
    $effect(() => {
        journalEntry = {
            title: form?.title ?? '',
            content: form?.content ?? ''
        };
    });

</script>

<h1>Create New Journal Entry</h1>

{#if form?.message}
    <p style="color: red;">{form.message}</p>
{/if}

<!-- POSTs to the 'default' action -->
<!-- For a named action: <form method="POST" action="?/updateTitle"> -->
<form method="POST">
    <div class="form-group">
        <label for="title">
            {FORM_LABELS.TITLE}
        </label>
        <input
            type="text"
            id="title"
            name="title"
            bind:value={journalEntry.title}
            required
        />
    </div>

    <div class="form-group">
        <label for="content">
                {FORM_LABELS.CONTENT}
        </label>
        <textarea
                id="content"
                name="content"
                bind:value={journalEntry.content}
                required
        />
    </div>

    <button type="submit" >
        {FORM_LABELS.SUBMIT}
    </button>
</form>


```

    SvelteKit's `<form>` enhancements provide progressive enhancement.

## 6. API Endpoints (`+server.ts`)

If you need to create backend API endpoints that are not directly tied to a page's `load` or `actions` (e.g., for client-side `fetch` calls, webhooks, or a separate mobile app):

- Create a `+server.ts` (or `.js`) file in a `src/routes/` directory.
- Export functions named after HTTP methods (e.g., `GET`, `POST`, `PUT`, `DELETE`).
- These functions run **on the server**.
- **Example (`src/routes/api/potd/+server.ts` - Prompt of the Day API):**

    ```typescript
    // src/routes/api/potd/+server.ts
    import type { RequestHandler } from './$types';
    import { json } from '@sveltejs/kit';

    const prompts = [
        'What are you grateful for today?',
        'Describe a recent challenge.',
    ];

    export const GET: RequestHandler = async () => {
        const randomPrompt =
            prompts[Math.floor(Math.random() * prompts.length)];
        return json({ prompt: randomPrompt });
    };

    // Example POST endpoint
    // export const POST: RequestHandler = async ({ request }) => {
    //   const body = await request.json();
    //   console.log('Received data:', body);
    //   return json({ message: 'Data received', received: body }, { status: 201 });
    // };
    ```

    This creates an API endpoint at `/api/potd` that responds to GET requests.

## 7. Server-Only Code (`src/lib/server/`)

- Any modules placed in `src/lib/server/` are **guaranteed to only run on the server**.
- SvelteKit ensures these modules are **not bundled into your client-side JavaScript**.
- This is the perfect place for:
    - Database connection logic (`src/lib/server/database.ts`).
    - Code that uses secret API keys or environment variables that should not be exposed to the client.
    - Complex business logic that should only execute server-side.
- You can import modules from `src/lib/server/` into your `+page.server.ts` and `+server.ts` files. You cannot import them directly into `+page.svelte` or client-side `src/lib/` files.

## 8. Shared Code (`src/lib/`)

- The `src/lib/` directory is for code that can be shared across your application.
- **Components:** Reusable Svelte components (`src/lib/components/`).
- **Utilities:** Helper functions that can run on both client and server (`src/lib/utils/`).
- **Stores:** Svelte stores for state management (`src/lib/stores/`).
- **Types:** TypeScript interfaces and types (`src/lib/types/` or colocated).
- You can import from `$lib` (e.g., `import MyComponent from '$lib/components/MyComponent.svelte';`).

## 9. Environment Variables

SvelteKit uses Vite's system for environment variables.

- Create `.env` files in your project root (e.g., `.env`, `.env.development`, `.env.production`).
- **Public Variables (Client-Side Access):** Must be prefixed with `PUBLIC_` (e.g., `PUBLIC_API_BASE_URL`).
    - Accessed via `import.meta.env.PUBLIC_YOUR_VARIABLE_NAME`.
- **Private Variables (Server-Side Only):** No prefix (e.g., `DATABASE_URL`, `API_SECRET_KEY`).
    - Accessed via `import.meta.env.YOUR_VARIABLE_NAME` **only in server-side code** (e.g., `+page.server.ts`, `+server.ts`, `src/lib/server/`).
    - SvelteKit prevents these from being bundled into client code.
- Do not commit your actual `.env` files. Commit a `.env.example` template.

## 10. Key SvelteKit Globals & Types

- **`./$types`:** In `+page.svelte`, `+page.server.ts`, `+layout.svelte`, etc., you'll often import types like `PageData`, `PageServerLoad`, `ActionData`, `Actions`, `RequestHandler` from `'./$types'`. SvelteKit automatically generates these types based on your `load` functions and `actions`, providing excellent type safety.
- **`$app/state`:** Provides rune-like reactive objects for accessing page data, navigation state, etc., replacing `$app/stores`.
- `page`: Contains `url`, `params`, `data` (from `load` functions), `status`, `error`, and `state`.
    ```sveltehtml
    <script lang="ts">
        import { page } from '$app/state';
        // $page.url, $page.params, $page.data, $page.status, etc.
    </script>
    <p>Current path: {page.url.pathname}</p>
    <p>Entry ID from URL: {page.params.entryId}</p>
    {#if page.data.someLoadedData}
        <p>Data from load: {page.data.someLoadedData.title}</p>
    {/if}
    ```
- **`$app/forms`:** Provides `enhance` for progressive enhancement of forms, and `applyAction` for handling action results.
- **`$app/navigation`:** Provides `goto`, `invalidate`, `invalidateAll`, `preloadData`, `preloadCode` for programmatic navigation and data reloading.
- **`@sveltejs/kit`:** Provides utilities like `error`, `fail`, `redirect`, `json`. **NOTE:** `error` and `redirect` are called directly, rather than thrown.

## 11. Building & Adapters

- `npm run build` compiles your SvelteKit application.
- **Adapters** are crucial. They adapt your SvelteKit app to run on specific deployment platforms (e.g., `adapter-node` for Node.js servers, `adapter-vercel` for Vercel, `adapter-static` for static site generation).
- You configure the adapter in `svelte.config.js`. For our dynamic app with a database, `adapter-node` or platform-specific adapters like Vercel/Netlify are common.

## 12. Tips for Svelte Developers New to SvelteKit

- **Embrace the Conventions:** SvelteKit's file naming (`+page.svelte`, `+server.ts`) is key.
- **Think Full-Stack:** `+page.server.ts` is your mini-backend for that page.
- **Leverage `$types`:** They provide fantastic type safety between your server logic and frontend components.
- **Start with Routing and Data Loading:** Get comfortable with how pages are created and how they get their initial data.
- **Read the Docs:** The official SvelteKit documentation is excellent and comprehensive. Refer to it often!
- **Small Experiments:** If unsure about a concept, create a small test route or component to try it out.
