# Lucia Authentication in SvelteKit with MongoDB

This guide provides the core setup for session-based authentication using Lucia in our SvelteKit & MongoDB project.

## Table of Contents

1.  [Core Lucia Setup (`src/lib/server/auth.ts`)](#core-lucia-setup-srclibserverauthts)
2.  [User Schema (Mongoose)](#user-schema-mongoose)
3.  [Server Hooks (`src/hooks.server.ts`)](#server-hooks-srchooksserverts)
4.  [Type Safety for `event.locals` (`src/app.d.ts`)](#type-safety-for-eventlocals-srcappdts)
5.  [Authentication Routes](#authentication-routes)
    - [A. Registration (`/register`)](#a-registration-register)
        - [`+page.svelte` (Svelte 5 Form)](#pagesvelte-svelte-5-form)
        - [`+page.server.ts` (Action)](#pageserverts-action)
    - [B. Login (`/login`)](#b-login-login)
        - [`+page.svelte` (Svelte 5 Form)](#pagesvelte-svelte-5-form_1)
        - [`+page.server.ts` (Action)](#pageserverts-action_1)
    - [C. Logout (`/logout`)](#c-logout-logout)
        - [`+server.ts` (Endpoint)](#serverts-endpoint)
6.  [Protecting Routes & Accessing User Data](#protecting-routes--accessing-user-data)
7.  [Password Hashing](#password-hashing)

## 1. Core Lucia Setup (`src/lib/server/auth.ts`)

Initialize Lucia and its MongoDB adapter. **Ensure Mongoose is connected before this runs.**

```typescript
// src/lib/server/auth.ts
import { Lucia } from 'lucia';
import { MongodbAdapter } from '@lucia-auth/adapter-mongodb';
import mongoose from 'mongoose';
import { dev } from '$app/environment';
// Ensure your Mongoose connection (from database.ts) is established before this.
// Example: await connectToDatabaseMongoose(); if not already handled in hooks.

const adapter = new MongodbAdapter(
    mongoose.connection.collection('sessions'),
    mongoose.connection.collection('users')
);

export const lucia = new Lucia(adapter, {
    sessionCookie: {
        attributes: { secure: !dev },
    },
    getUserAttributes: (attributes) => ({
        username: attributes.username,
        email: attributes.email,
        // Add other desired attributes from your User model
    }),
});

declare module 'lucia' {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: DatabaseUserAttributes;
    }
}

interface DatabaseUserAttributes {
    username: string;
    email: string;
    // Match fields from your User MongoDB document (excluding passwordHash)
}
```

## 2. User Schema (Mongoose)

Ensure your User model in `src/lib/server/models/User.ts` has an `_id` (Mongoose default) and necessary fields. Lucia uses `_id` (as a string) for `userId`.

```typescript
// src/lib/server/models/User.ts (Excerpt)
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserSchema extends Document {
    username: string;
    email: string;
    passwordHash: string;
}
const UserSchema: Schema<IUserSchema> = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    // ... other fields like createdAt
});
const UserModel: Model<IUserSchema> =
    mongoose.models.User || mongoose.model<IUserSchema>('User', UserSchema);
export default UserModel;
```

_(When creating users, you might explicitly set `_id` using `generateId` from `lucia` if you don't want to rely on Mongoose's ObjectId stringified, for simpler key management with Lucia.)_

## 3. Server Hooks (`src/hooks.server.ts`)

Validate session cookies and set `event.locals.user` and `event.locals.session`.

```typescript
// src/hooks.server.ts
import { lucia } from '$lib/server/auth';
import type { Handle } from '@sveltejs/kit';
import { connectToDatabaseMongoose } from '$lib/server/database'; // Your DB connection

await connectToDatabaseMongoose(); // Ensure DB is connected on startup

export const handle: Handle = async ({ event, resolve }) => {
    const sessionId = event.cookies.get(lucia.sessionCookieName);
    if (!sessionId) {
        event.locals.user = null;
        event.locals.session = null;
        return resolve(event);
    }

    const { session, user } = await lucia.validateSession(sessionId);
    if (session && session.fresh) {
        const sessionCookie = lucia.createSessionCookie(session.id);
        event.cookies.set(sessionCookie.name, sessionCookie.value, {
            path: '/', // Required path, '/' is typical for sessions
            ...sessionCookie.attributes,
        });
    }
    if (!session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        event.cookies.set(sessionCookie.name, sessionCookie.value, {
            path: '/', // Required path
            ...sessionCookie.attributes,
        });
    }
    event.locals.user = user;
    event.locals.session = session;
    return resolve(event);
};
```

## 4. Type Safety for `event.locals` (`src/app.d.ts`)

```typescript
// src/app.d.ts
import type { User, Session } from 'lucia';

declare global {
    namespace App {
        interface Locals {
            user: User | null;
            session: Session | null;
        }
        // interface PageData {} ...
    }
}
export {};
```

## 5. Authentication Routes

### A. Registration (`/register`)

**`src/routes/register/+page.svelte` (Svelte 5 Form)**

```sveltehtml
<script lang="ts">
  import type { ActionData } from './$types';
  let form : { form?: ActionData } = $props();
  let username = $state(form?.username ?? '');
  let email = $state(form?.email ?? '');
  let password = $state('');
  $effect(() => { username = form?.username ?? ''; email = form?.email ?? ''; });
</script>

<h1>Register</h1>
{#if form?.message}<p style="color:red;">{form.message}</p>{/if}
<!-- Consider showing form?.errors too -->
<form method="POST">
  <div><label for="username">Username:</label><input id="username" name="username" bind:value={username} required /></div>
  <div><label for="email">Email:</label><input type="email" id="email" name="email" bind:value={email} required /></div>
  <div><label for="password">Password:</label><input type="password" id="password" name="password" bind:value={password} required /></div>
  <button type="submit">Register</button>
</form>
<p>Already have an account? <a href="/login">Login</a></p>
```

**`src/routes/register/+page.server.ts` (Action)**

```typescript
import { lucia } from '$lib/server/auth';
import UserModel from '$lib/server/models/User';
import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { generateId } from 'lucia';
import { Argon2id } from 'oslo/password';
import { connectToDatabaseMongoose } from '$lib/server/database';

await connectToDatabaseMongoose();

export const load: PageServerLoad = async ({ locals }) => {
    if (locals.user) redirect(303, '/'); // SvelteKit 2.x: No 'throw'
    return {};
};

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const formData = await request.formData();
        const username = formData.get('username') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        // --- Basic Validation (add more as needed) ---
        if (!username || username.length < 3)
            return fail(400, { message: 'Invalid username', username, email });
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            return fail(400, { message: 'Invalid email', username, email });
        if (!password || password.length < 6)
            return fail(400, {
                message: 'Password too short',
                username,
                email,
            });

        // --- Check if user exists (implement robustly) ---
        const existingUser = await UserModel.findOne({
            $or: [{ username }, { email }],
        }).lean();
        if (existingUser)
            return fail(400, {
                message: 'Username or email already taken',
                username,
                email,
            });

        const userId = generateId(15); // Lucia-generated ID
        const passwordHash = await new Argon2id().hash(password);

        try {
            await UserModel.create({
                _id: userId,
                username,
                email,
                passwordHash,
            }); // Use Lucia's generated ID for _id
            const session = await lucia.createSession(userId, {});
            const sessionCookie = lucia.createSessionCookie(session.id);
            cookies.set(sessionCookie.name, sessionCookie.value, {
                path: '/',
                ...sessionCookie.attributes,
            });
        } catch (e) {
            console.error('Reg Error:', e);
            return fail(500, {
                message: 'Registration failed.',
                username,
                email,
            });
        }
        redirect(303, '/'); // SvelteKit 2.x: No 'throw'
    },
};
```

### B. Login (`/login`)

**`src/routes/login/+page.svelte` (Svelte 5 Form)**

```sveltehtml
<script lang="ts">
  import type { ActionData } from './$types';
  let form : { form?: ActionData } = $props();
  let email = $state(form?.email ?? '');
  let password = $state('');
  $effect(() => { email = form?.email ?? '';});
</script>

<h1>Login</h1>
{#if form?.message}<p style="color:red;">{form.message}</p>{/if}
<form method="POST">
  <div><label for="email">Email:</label><input type="email" id="email" name="email" bind:value={email} required /></div>
  <div><label for="password">Password:</label><input type="password" id="password" name="password" bind:value={password} required /></div>
  <button type="submit">Login</button>
</form>
<p>No account? <a href="/register">Register</a></p>
```

**`src/routes/login/+page.server.ts` (Action)**

```typescript
import { lucia } from '$lib/server/auth';
import UserModel from '$lib/server/models/User';
import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { Argon2id } from 'oslo/password';
import { connectToDatabaseMongoose } from '$lib/server/database';

await connectToDatabaseMongoose();

export const load: PageServerLoad = async ({ locals }) => {
    if (locals.user) redirect(303, '/'); // SvelteKit 2.x: No 'throw'
    return {};
};

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const formData = await request.formData();
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        if (!email || !password)
            return fail(400, { message: 'Missing email or password', email });

        const existingUser = await UserModel.findOne({ email }).lean(); // Use .lean()
        if (!existingUser)
            return fail(400, { message: 'Incorrect email or password', email });

        const validPassword = await new Argon2id().verify(
            existingUser.passwordHash,
            password
        );
        if (!validPassword)
            return fail(400, { message: 'Incorrect email or password', email });

        // Ensure existingUser._id is string for Lucia
        const userId = existingUser._id.toString();

        const session = await lucia.createSession(userId, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        cookies.set(sessionCookie.name, sessionCookie.value, {
            path: '/',
            ...sessionCookie.attributes,
        });
        redirect(303, '/'); // SvelteKit 2.x: No 'throw'
    },
};
```

### C. Logout (`/logout`)

**`src/routes/logout/+server.ts` (Endpoint)**

```typescript
import { lucia } from '$lib/server/auth';
import { redirect, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, cookies }) => {
    if (!locals.session) {
        // User not logged in, perhaps just redirect or send a success-like response anyway
        redirect(303, '/login'); // SvelteKit 2.x: No 'throw'
        return; // Or error(401, 'Unauthorized'); if strictness is preferred
    }
    await lucia.invalidateSession(locals.session.id);
    const sessionCookie = lucia.createBlankSessionCookie();
    cookies.set(sessionCookie.name, sessionCookie.value, {
        path: '/',
        ...sessionCookie.attributes,
    });
    redirect(303, '/login'); // SvelteKit 2.x: No 'throw'
};
```

_Frontend trigger:_

```sveltehtml
<form method="POST" action="/logout"><button type="submit">Logout</button></form>
```

## 6. Protecting Routes & Accessing User Data

- **In `load` functions:** Check `locals.user`. If null, `redirect(303, '/login');`.
- **In `actions`:** Check `locals.user` before performing mutations.
- **Accessing User in Components:**
    - Data loaded in `load` (including `user` from a layout load) is available via the `data` prop: `let { data }: { data: PageData } = $props();`.
    - Or reactively via `import { page } from '$app/state';` then `{page.data.user}` (Svelte 5 / SvelteKit 2.12+).

**Example Protected Route Load (`src/routes/dashboard/+page.server.ts`):**

```typescript
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        redirect(303, '/login?redirectTo=/dashboard'); // SvelteKit 2.x: No 'throw'
    }
    return { user: locals.user }; // Pass user to the page
};
```

## 7. Password Hashing

Use `oslo/password` (e.g., `Argon2id`) for hashing and verification. This is shown in the registration and login actions.
