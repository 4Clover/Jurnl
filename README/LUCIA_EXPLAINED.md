# Implementing Authentication with Lucia in SvelteKit

## Table of Contents

1.  [Why Lucia?](#why-lucia)
2.  [Installation](#installation)
3.  [Core Lucia Setup (`src/lib/server/auth.ts`)](#core-lucia-setup-srclibserverauthts)
    - [Adapter for MongoDB](#adapter-for-mongodb)
    - [Initializing Lucia](#initializing-lucia)
4.  [Updating User Schema (Mongoose)](#updating-user-schema-mongoose)
5.  [Server Hooks (`src/hooks.server.ts`)](#server-hooks-srchooksserverts)
    - [Validating Sessions & Setting `event.locals`](#validating-sessions--setting-eventlocals)
6.  [Type Safety for `event.locals`](#type-safety-for-eventlocals)
7.  [Authentication Routes & Logic](#authentication-routes--logic)
    - [A. User Registration (`/register`)](#a-user-registration-register)
        - [`+page.svelte` (Registration Form)](#pagesvelte-registration-form)
        - [`+page.server.ts` (Registration Action)](#pageserverts-registration-action)
    - [B. User Login (`/login`)](#b-user-login-login)
        - [`+page.svelte` (Login Form)](#pagesvelte-login-form)
        - [`+page.server.ts` (Login Action)](#pageserverts-login-action)
    - [C. User Logout (`/logout`)](#c-user-logout-logout)
        - [`+server.ts` (Logout Endpoint)](#serverts-logout-endpoint)
8.  [Protecting Routes](#protecting-routes)
    - [In `load` functions](#in-load-functions)
    - [In `actions`](#in-actions)
    - [Layout Groups for Protected Sections](#layout-groups-for-protected-sections)
9.  [Accessing User Data in Components](#accessing-user-data-in-components)
10. [Password Hashing](#password-hashing)
11. [Session Management](#session-management)
12. [Key Considerations & Next Steps](#key-considerations--next-steps)

---

## 1. Why Lucia?

Lucia (`lucia-auth`) is a modern, lightweight, and flexible authentication library for JavaScript/TypeScript environments. Key benefits for our SvelteKit project:

- **Framework Agnostic Core:** While providing excellent SvelteKit integration.
- **Session-Based:** Secure and standard.
- **Adapter System:** Easily integrates with various databases (like MongoDB) and runtimes.
- **TypeScript First:** Great type safety.
- **Extensible:** Supports OAuth providers, password reset, email verification, etc., through official or community packages.
- **Focus on Security:** Implements best practices for session management and CSRF protection.

## 2. Installation

Install Lucia and its MongoDB adapter, along with a password hashing library:

```bash
npm install lucia @lucia-auth/adapter-mongodb oslo # oslo for password hashing and other utils
```

## 3. Core Lucia Setup (`src/lib/server/auth.ts`)

This is where you initialize Lucia and configure its adapter. This file **must** be in `src/lib/server/` as it contains sensitive logic and interacts with the database.

### Adapter for MongoDB

Lucia needs an adapter to communicate with MongoDB for storing user and session data.

### Initializing Lucia

```typescript
// src/lib/server/auth.ts
import { Lucia } from 'lucia';
import { MongodbAdapter } from '@lucia-auth/adapter-mongodb';
import mongoose from 'mongoose'; // Assuming you use Mongoose for connection management
import { dev } from '$app/environment';

// Ensure your Mongoose connection is established before Lucia tries to use it.
// You might have already called this in `database.ts` or `hooks.server.ts`.
// If not, ensure mongoose.connection.readyState is checked or connect here.
// Example: await connectToDatabaseMongoose(); from your database.ts

if (mongoose.connection.readyState !== 1) {
    // This is a simplified check. In a real app, you'd await your Mongoose connection setup.
    // See your `src/lib/server/database.ts` for the connection logic.
    console.warn(
        'Mongoose not connected when auth.ts is initializing. Ensure DB is connected first.'
    );
    // Ideally, your Mongoose connection promise resolves before this file's code fully executes.
}

// IMPORTANT: Ensure mongoose.connection refers to your active Mongoose connection
// and that your User and Session models are registered with this connection.
const adapter = new MongodbAdapter(
    mongoose.connection.collection('sessions'), // Collection for sessions
    mongoose.connection.collection('users') // Collection for users
);

export const lucia = new Lucia(adapter, {
    sessionCookie: {
        attributes: {
            // set to `true` when using HTTPS
            secure: !dev, // In production, cookies should only be sent over HTTPS
        },
    },
    // Define what user data is available in the session and `locals.user`
    getUserAttributes: (attributes) => {
        return {
            // attributes has the type of UserAttributes
            // `UserAttributes` is defined by Lucia and generally includes all fields from your user DB schema
            // minus the passwordHash
            username: attributes.username,
            email: attributes.email,
            // Add any other attributes you want readily available
            // e.g., profilePictureUrl: attributes.profilePictureUrl
        };
    },
});

// IMPORTANT: Define types for Lucia user and session
declare module 'lucia' {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: DatabaseUserAttributes; // Raw user attributes from DB
        // DatabaseSessionAttributes: DatabaseSessionAttributes; // If you have custom session attributes
    }
}

// This should match the structure of your User document in MongoDB, excluding password
interface DatabaseUserAttributes {
    username: string;
    email: string;
    // any other fields you store on the user document that you might want to access
    // e.g. profilePictureUrl: string;
}
```

- **Make sure your Mongoose connection is established _before_ Lucia's adapter tries to use it.** This often means ensuring your `connectToDatabaseMongoose()` from `database.ts` is awaited in `hooks.server.ts` before any route handlers run.
- The collection names (`sessions`, `users`) must match what MongoDB uses.
- `getUserAttributes`: Defines which attributes from your user document are attached to the `User` object available in `locals.user`.

## 4. Updating User Schema (Mongoose)

Lucia requires your user documents to have an `_id` field that it uses as the user ID. Mongoose does this by default. Your `IUser` interface and `UserSchema` (from the MongoDB setup doc) are mostly fine. Lucia will manage session information in a separate `sessions` collection.

```typescript
// src/lib/server/models/User.ts (ensure _id is present, Mongoose adds it)
import mongoose, { Schema, Document, Model } from 'mongoose';

// This interface can be used for DatabaseUserAttributes in auth.ts
export interface IUserSchema extends Document {
    // _id is automatically added by Mongoose as an ObjectId
    username: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
}

const UserSchema: Schema<IUserSchema> = new Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    passwordHash: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

// Lucia's adapter will use this `_id` (stringified) as the user ID.
// Mongoose uses `_id` of type ObjectId by default. Lucia handles this.

const UserModel: Model<IUserSchema> =
    mongoose.models.User || mongoose.model<IUserSchema>('User', UserSchema);
export default UserModel;
```

## 5. Server Hooks (`src/hooks.server.ts`)

Server hooks allow you to run code on every request. We'll use it to validate the session cookie and attach user/session information to `event.locals`.

### Validating Sessions & Setting `event.locals`

```typescript
// src/hooks.server.ts
import { lucia } from '$lib/server/auth';
import type { Handle } from '@sveltejs/kit';
import { connectToDatabaseMongoose } from '$lib/server/database'; // Your DB connection function

// Ensure database is connected on server startup
// This is a good place to establish the connection once.
await connectToDatabaseMongoose();
console.log('Database connection ensured from hooks.server.ts');

export const handle: Handle = async ({ event, resolve }) => {
    const sessionId = event.cookies.get(lucia.sessionCookieName);

    if (!sessionId) {
        event.locals.user = null;
        event.locals.session = null;
        return resolve(event);
    }

    const { session, user } = await lucia.validateSession(sessionId);

    if (session && session.fresh) {
        // If session is fresh (e.g., just created or password changed),
        // create a new session cookie with updated expiration
        const sessionCookie = lucia.createSessionCookie(session.id);
        event.cookies.set(sessionCookie.name, sessionCookie.value, {
            path: '.',
            ...sessionCookie.attributes,
        });
    }

    if (!session) {
        // Invalid session, create a blank one to remove existing invalid cookie
        const sessionCookie = lucia.createBlankSessionCookie();
        event.cookies.set(sessionCookie.name, sessionCookie.value, {
            path: '.',
            ...sessionCookie.attributes,
        });
    }

    event.locals.user = user; // User object (or null)
    event.locals.session = session; // Session object (or null)

    return resolve(event);
};
```

Now, in any `load` function, `action`, or `+server.ts` handler, you can access `event.locals.user` and `event.locals.session`.

## 6. Type Safety for `event.locals`

Update your `src/app.d.ts` to include types for `user` and `session` on `event.locals`:

```typescript
// src/app.d.ts
import type { User, Session } from 'lucia';

declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            user: User | null;
            session: Session | null;
        }
        // interface PageData {}
        // interface Platform {}
    }
}

export {};
```

## 7. Authentication Routes & Logic

You'll need pages and server logic for registration, login, and logout.

### A. User Registration (`/register`)

#### `+page.svelte` (Registration Form)

```sveltehtml
<!-- src/routes/register/+page.svelte -->
<script lang="ts">
  import type { ActionData } from './$types';
  // `form` can be undefined initially or if action was successful (redirect)
  let form : { form?: ActionData } = $props();

  let username = $state(form?.username ?? '');
  let email = $state(form?.email ?? '');
  let password = $state(''); // Don't prefill password

  // Update local state if form prop changes (e.g., due to validation error)
  $effect(() => {
    username = form?.username ?? '';
    email = form?.email ?? '';
    // Do not re-populate password field for security
  });
</script>

<h1>Register</h1>

{#if form?.message}
  <p class="error">{form.message}</p>
{/if}
{#if form?.errors}
  <ul class="error">
    {#each Object.entries(form.errors) as [field, errorMsg]}
      <li>{field}: {errorMsg}</li>
    {/each}
  </ul>
{/if}

<form method="POST">
  <div>
    <label for="username">Username:</label>
    <input type="text" id="username" name="username" bind:value={username} required />
  </div>
  <div>
    <label for="email">Email:</label>
    <input type="email" id="email" name="email" bind:value={email} required />
  </div>
  <div>
    <label for="password">Password:</label>
    <input type="password" id="password" name="password" bind:value={password} required />
  </div>
  <button type="submit">Register</button>
</form>

<p>Already have an account? <a href="/login">Login</a></p>

<style>.error { color: red; }</style>
```

#### `+page.server.ts` (Registration Action)

```typescript
// src/routes/register/+page.server.ts
import { lucia } from '$lib/server/auth';
import UserModel from '$lib/server/models/User'; // Your Mongoose User model
import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { generateId } from 'lucia';
import { Argon2id } from 'oslo/password'; // For password hashing
import { connectToDatabaseMongoose } from '$lib/server/database';

await connectToDatabaseMongoose();

// Optional: If already logged in, redirect from register page
export const load: PageServerLoad = async ({ locals }) => {
    if (locals.user) {
        throw redirect(303, '/'); // Or to a dashboard
    }
    return {};
};

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const formData = await request.formData();
        const username = formData.get('username');
        const email = formData.get('email');
        const password = formData.get('password');

        // --- Basic Validation ---
        if (
            typeof username !== 'string' ||
            username.length < 3 ||
            username.length > 31
        ) {
            return fail(400, { message: 'Invalid username', username, email });
        }
        if (
            typeof email !== 'string' ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {
            return fail(400, { message: 'Invalid email', username, email });
        }
        if (
            typeof password !== 'string' ||
            password.length < 6 ||
            password.length > 255
        ) {
            return fail(400, {
                message: 'Invalid password (must be 6-255 characters)',
                username,
                email,
            });
        }

        // --- Check if user already exists ---
        try {
            const existingUserByUsername = await UserModel.findOne({
                username,
            }).lean();
            if (existingUserByUsername) {
                return fail(400, {
                    message: 'Username already taken',
                    username,
                    email,
                });
            }
            const existingUserByEmail = await UserModel.findOne({
                email,
            }).lean();
            if (existingUserByEmail) {
                return fail(400, {
                    message: 'Email already registered',
                    username,
                    email,
                });
            }
        } catch (e) {
            console.error('DB error checking existing user:', e);
            return fail(500, {
                message: 'Database error, please try again.',
                username,
                email,
            });
        }

        const userId = generateId(15); // Generate a user ID
        const passwordHash = await new Argon2id().hash(password);

        try {
            await UserModel.create({
                _id: userId, // Lucia uses this as the primary key for its adapter
                username,
                email,
                passwordHash,
            });

            // Create session for the new user
            const session = await lucia.createSession(userId, {}); // {} for session attributes if any
            const sessionCookie = lucia.createSessionCookie(session.id);
            cookies.set(sessionCookie.name, sessionCookie.value, {
                path: '.',
                ...sessionCookie.attributes,
            });
        } catch (e: any) {
            // Catch specific errors like duplicate key if possible
            console.error('Error creating user or session:', e);
            // Mongoose duplicate key error for unique fields (username/email)
            if (e.code === 11000) {
                const field = Object.keys(e.keyPattern)[0];
                return fail(400, {
                    message: `${field.charAt(0).toUpperCase() + field.slice(1)} already in use.`,
                    username,
                    email,
                });
            }
            return fail(500, {
                message: 'An unexpected error occurred.',
                username,
                email,
            });
        }

        throw redirect(303, '/'); // Redirect to home or dashboard after successful registration
    },
};
```

- Note the use of `_id: userId` when creating the user. Lucia expects the primary user ID to be what it generates or what you provide and then uses. If your Mongoose schema auto-generates `_id` as an `ObjectId` and you want to use _that_ as Lucia's `userId`, you would pass `existingMongooseUser._id.toString()` to `lucia.createSession`. However, it's often simpler to let Lucia manage the ID or generate one as shown. If you want to use Mongoose's `ObjectId` for `_id` and also for Lucia, you'd need to ensure the types align or stringify it for Lucia. For simplicity with `@lucia-auth/adapter-mongodb`, it often expects the `_id` field on the user document to be the string user ID. The example above explicitly sets `_id` to `userId` from `generateId(15)`.

### B. User Login (`/login`)

#### `+page.svelte` (Login Form)

```sveltehtml
<!-- src/routes/login/+page.svelte -->
<script lang="ts">
  import type { ActionData } from './$types';
  let { form }: { form?: ActionData } = $props();

  let email = $state(form?.email ?? ''); // Or username if you allow login with username
  let password = $state('');

  $effect(() => {
    email = form?.email ?? '';
  });
</script>

<h1>Login</h1>

{#if form?.message}
  <p class="error">{form.message}</p>
{/if}

<form method="POST">
  <div>
    <label for="email">Email:</label>
    <input type="email" id="email" name="email" bind:value={email} required />
  </div>
  <div>
    <label for="password">Password:</label>
    <input type="password" id="password" name="password" bind:value={password} required />
  </div>
  <button type="submit">Login</button>
</form>

<p>Don't have an account? <a href="/register">Register</a></p>

<style>.error { color: red; }</style>
```

#### `+page.server.ts` (Login Action)

```typescript
// src/routes/login/+page.server.ts
import { lucia } from '$lib/server/auth';
import UserModel from '$lib/server/models/User';
import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { Argon2id } from 'oslo/password';
import { connectToDatabaseMongoose } from '$lib/server/database';

await connectToDatabaseMongoose();

export const load: PageServerLoad = async ({ locals }) => {
    if (locals.user) {
        throw redirect(303, '/');
    }
    return {};
};

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const formData = await request.formData();
        const email = formData.get('email'); // Or username
        const password = formData.get('password');

        if (
            typeof email !== 'string' ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {
            return fail(400, { message: 'Invalid email', email });
        }
        if (
            typeof password !== 'string' ||
            password.length < 6 ||
            password.length > 255
        ) {
            return fail(400, { message: 'Invalid password', email });
        }

        const existingUser = await UserModel.findOne({ email }).lean(); // Use .lean() for checking
        if (!existingUser) {
            return fail(400, { message: 'Incorrect email or password', email });
        }

        const validPassword = await new Argon2id().verify(
            existingUser.passwordHash,
            password
        );
        if (!validPassword) {
            return fail(400, { message: 'Incorrect email or password', email });
        }

        // Lucia expects user._id to be the string user ID
        // If existingUser._id is an ObjectId, ensure it's stringified
        // In our register example, we stored _id as a string.
        const userId = existingUser._id.toString(); // Ensure it's a string

        const session = await lucia.createSession(userId, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        cookies.set(sessionCookie.name, sessionCookie.value, {
            path: '.',
            ...sessionCookie.attributes,
        });

        throw redirect(303, '/'); // Redirect to home or dashboard
    },
};
```

### C. User Logout (`/logout`)

Logout is typically a POST request to an endpoint that invalidates the session.

#### `+server.ts` (Logout Endpoint)

```typescript
// src/routes/logout/+server.ts
import { lucia } from '$lib/server/auth';
import { redirect, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, cookies }) => {
    if (!locals.session) {
        throw error(401, 'Unauthorized'); // Or just redirect
    }

    await lucia.invalidateSession(locals.session.id); // Invalidate the session

    // Create a blank session cookie to remove the existing one from the browser
    const sessionCookie = lucia.createBlankSessionCookie();
    cookies.set(sessionCookie.name, sessionCookie.value, {
        path: '.',
        ...sessionCookie.attributes,
    });

    throw redirect(303, '/login'); // Redirect to login page
};
```

To trigger this from the frontend, you'd use a form that POSTs to `/logout`:

```sveltehtml
<!-- Example in a Navbar.svelte -->
<form method="POST" action="/logout">
  <button type="submit">Logout</button>
</form>
```

## 8. Protecting Routes

Use `event.locals.user` to check for an authenticated user.

### In `load` functions

```typescript
// src/routes/dashboard/+page.server.ts
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        throw redirect(303, '/login?redirectTo=/dashboard'); // Redirect to login, optionally pass redirectTo
    }
    // ... load dashboard data for locals.user
    return {
        user: locals.user, // Pass user data to the page
    };
};
```

### In `actions`

Check `locals.user` at the beginning of your action function, as shown in the registration/login examples.

### Layout Groups for Protected Sections

You can use SvelteKit layout groups to apply authentication checks to an entire section of your site.
Create a layout group like `src/routes/(app)/+layout.server.ts`:

```typescript
// src/routes/(app)/+layout.server.ts
// This load function applies to all routes inside the (app) group, e.g., /dashboard, /profile
import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ locals, url }) => {
    if (!locals.user) {
        // Construct redirectTo path carefully to avoid open redirect vulnerabilities
        const redirectTo = url.pathname + url.search; // current path
        throw redirect(
            303,
            `/login?redirectTo=${encodeURIComponent(redirectTo)}`
        );
    }
    return {
        user: locals.user, // Make user available to all pages in this layout group
    };
};
```

Then, place protected routes inside `src/routes/(app)/`, e.g., `src/routes/(app)/dashboard/+page.svelte`.

## 9. Accessing User Data in Components

The `user` object from `locals.user` can be passed down from `load` functions to your pages and components via the `data` prop.

```sveltehtml
<!-- src/routes/(app)/dashboard/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  // PageData here would include `user` from the (app)/+layout.server.ts load function
  let data : { data: PageData } = $props();
</script>

{#if data.user}
  <h1>Welcome, {data.user.username}!</h1>
  <p>Your email: {data.user.email}</p>
{:else}
  <p>Loading user data or not logged in...</p>
{/if}
```

## 10. Password Hashing

We used `oslo/password` (specifically `Argon2id`) in the examples. This is a modern and secure hashing algorithm.

- **Always hash passwords before storing them.**
- **Never store plain-text passwords.**
- Use `new Argon2id().hash(password)` to hash.
- Use `new Argon2id().verify(storedHash, providedPassword)` to verify.

## 11. Session Management

Lucia handles session creation, validation, and invalidation.

- Session IDs are stored in secure, HTTP-only cookies.
- Session data is stored in your MongoDB `sessions` collection.
- Lucia's `validateSession` in `hooks.server.ts` keeps `locals.user` and `locals.session` up-to-date.

## 12. Key Considerations & Next Steps

- **Error Handling:** Implement robust error handling in your actions and load functions.
- **Input Validation:** Use libraries like Zod for comprehensive validation beyond basic checks.
- **CSRF Protection:** Lucia provides CSRF protection mechanisms, especially for stateless actions. SvelteKit's default form actions with cookies provide a good level of protection. Review Lucia docs for specific CSRF recommendations if you deviate.
- **Email Verification & Password Reset:** These are common next steps. Lucia often has examples or you can implement them using its primitives (generating tokens, etc.).
- **OAuth Providers (e.g., Google, GitHub):** Lucia supports OAuth. You'd install specific provider packages (e.g., `@lucia-auth/oauth`, `arctic` for generic OAuth clients) and configure them.
- **Rate Limiting:** Protect your auth endpoints from brute-force attacks.
- **Database Indexes:** Ensure you have indexes on `username` and `email` in your `users` collection for faster lookups.

Consult the official Lucia documentation for the most up-to-date information and advanced features.
