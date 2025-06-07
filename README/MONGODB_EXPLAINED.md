# Integrating MongoDB with SvelteKit for Backend Data

## Table of Contents

1.  [MongoDB's Role in Our Application](#mongodbs-role-in-our-application)
2.  [Setting Up MongoDB Connection](#setting-up-mongodb-connection)
    - [Environment Variables](#environment-variables_1)
    - [Database Connection Module (`src/lib/server/database.ts`)](#database-connection-module-srclibserverdatabasets)
3.  [Structuring Data: Schemas & Models (with Mongoose - Optional but Recommended)](#structuring-data-schemas--models-with-mongoose---optional-but-recommended)
    - [Why Mongoose?](#why-mongoose)
    - [Defining Schemas](#defining-schemas)
    - [Creating Models](#creating-models)
4.  [Interacting with MongoDB in SvelteKit](#interacting-with-mongodb-in-sveltekit)
    - [Fetching Data (`load` functions in `+page.server.ts`)](#fetching-data-load-functions-in-pageserverts)
    - [Modifying Data (`actions` in `+page.server.ts`)](#modifying-data-actions-in-pageserverts)
    - [API Endpoints (`+server.ts`)](#api-endpoints-serverts_1)
5.  [Data Validation](#data-validation)
6.  [Security Considerations](#security-considerations)
    - [User Data Isolation](#user-data-isolation)
    - [Input Sanitization](#input-sanitization)
7.  [Error Handling](#error-handling)
8.  [Best Practices](#best-practices)

---

## 1. MongoDB's Role in Our Application

MongoDB is a NoSQL document database. For our journaling app, it will store:

- **User Accounts:** Usernames, hashed passwords, email, profile information.
- **Journal Entries:** Title, content (potentially rich text/JSON), creation/update dates, associated user ID, images, sticker positions, font choices, paper styles.
- **Public Blogs/Replies:** (If implemented) Blog content, replies, user associations.
- **Friend Relationships:** (If implemented)
- Any other persistent data our application requires.

Its flexibility with document structures is well-suited for evolving features like custom paper, stickers, and varied content within entries.

## 2. Setting Up MongoDB Connection

The MongoDB connection should only be established and used on the server-side.

### Environment Variables

Your MongoDB connection string (URI) must be stored securely as an environment variable.
In your `.env` file (or server environment):

```
MONGODB_URI="mongodb+srv://<username>:<password>@<your-cluster-url>/<database-name>?retryWrites=true&w=majority"
# Or for local Docker setup:
# MONGODB_URI="mongodb://localhost:27017/<database-name>"
```

This variable will **not** have the `PUBLIC_` prefix, as it's server-side only.

### Database Connection Module (`src/lib/server/database.ts`)

We will create a dedicated module in `src/lib/server/` to handle the MongoDB connection. This ensures the connection logic is centralized and only runs on the server.

**Example using the native `mongodb` driver:**

```typescript
// src/lib/server/database.ts
import { MongoClient, Db } from 'mongodb';
import { MONGODB_URI }_from '$env/static/private'; // SvelteKit's way to import private env vars

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env or .env.local');
}

const client = new MongoClient(MONGODB_URI);
let dbInstance: Db;

export async function connectToDatabase(): Promise<Db> {
  if (dbInstance) {
    return dbInstance;
  }
  try {
    await client.connect();
    console.log('Successfully connected to MongoDB!');
    // Extract database name from URI or set a default
    const dbName = MONGODB_URI.split('/').pop()?.split('?')[0] || 'myJournalApp';
    dbInstance = client.db(dbName);
    return dbInstance;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw new Error('Failed to connect to the database.');
  }
}

// Export the db instance directly after ensuring connection (simplified for common use)
// Or always call connectToDatabase() before operations if you prefer more explicit control
// This approach attempts to connect once and reuse the instance.
const db = await connectToDatabase();
export { db };
```

- **`$env/static/private`**: SvelteKit's module for accessing private (server-side) environment variables.
- This module establishes a connection and exports the `db` instance (or a function to get it). We aim to reuse the connection across requests for efficiency.

**Example using `mongoose` (ODM - Object Data Mapper):**

```typescript
// src/lib/server/database.ts (with Mongoose)
import mongoose from 'mongoose';
import { MONGODB_URI } from '$env/static/private';

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
}

let cachedConnection: typeof mongoose | null = null;

export async function connectToDatabaseMongoose() {
    if (cachedConnection) {
        console.log('Using cached database connection (Mongoose)');
        return cachedConnection;
    }

    try {
        cachedConnection = await mongoose.connect(MONGODB_URI, {
            // useNewUrlParser: true, // No longer needed in Mongoose 6+
            // useUnifiedTopology: true, // No longer needed in Mongoose 6+
            bufferCommands: false, // Disable buffering if you want immediate errors on connection issues
        });
        console.log('Successfully connected to MongoDB using Mongoose!');
        return cachedConnection;
    } catch (e) {
        console.error('Error connecting to MongoDB with Mongoose:', e);
        throw new Error('Failed to connect to the database with Mongoose.');
    }
}

// Call it once to establish the connection when this module is first imported by server-side code.
// (async () => await connectToDatabaseMongoose())(); // Or manage connection more explicitly
```

You would then import and use Mongoose models defined elsewhere.

## 3. Structuring Data: Schemas & Models (with Mongoose - Optional but Recommended)

While MongoDB is schema-less, using an Object Data Mapper (ODM) like **Mongoose** can provide structure, validation, and convenience, especially for larger applications.

### Why Mongoose?

- **Schema Definition:** Define the structure of your documents.
- **Data Validation:** Built-in validation rules (required fields, types, regex, custom).
- **Middleware:** Hooks for pre/post save, delete, etc.
- **Query Building:** Fluent API for constructing database queries.
- **Type Safety:** When used with TypeScript, Mongoose models can be strongly typed.

### Defining Schemas

If using Mongoose, you'll define schemas for your data structures. These usually go in `src/lib/server/models/`.

**Example (`src/lib/server/models/User.ts`):**

```typescript
// src/lib/server/models/User.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    username: string;
    email: string;
    passwordHash: string; // Store hashed passwords, never plain text
    createdAt: Date;
}

const UserSchema: Schema<IUser> = new Schema({
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

// Create the model or retrieve it if it already exists
// This prevents Mongoose from recompiling the model on every hot reload in dev
const UserModel: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default UserModel;
```

**Example (`src/lib/server/models/JournalEntry.ts`):**

```typescript
// src/lib/server/models/JournalEntry.ts
import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import type { IUser } from './User'; // Import user type for referencing

export interface IJournalEntry extends Document {
    userId: Types.ObjectId | IUser; // Reference to the User
    title: string;
    content: string; // Could be HTML string, Markdown, or a JSON object for rich content
    customizations?: {
        // For scrapbook features
        paperStyle?: string;
        font?: string;
        elements?: Array<{
            // For stickers, images within the entry
            type: 'image' | 'sticker' | 'text';
            src?: string; // URL for image/sticker
            text?: string;
            x: number;
            y: number;
            zIndex: number;
            width?: number;
            height?: number;
            rotation?: number;
        }>;
    };
    createdAt: Date;
    updatedAt: Date;
}

const JournalEntrySchema: Schema<IJournalEntry> = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        title: { type: String, required: true, trim: true },
        content: { type: String, required: true },
        customizations: {
            paperStyle: String,
            font: String,
            elements: [
                {
                    type: {
                        type: String,
                        enum: ['image', 'sticker', 'text'],
                        required: true,
                    },
                    src: String,
                    text: String,
                    x: { type: Number, required: true },
                    y: { type: Number, required: true },
                    zIndex: { type: Number, default: 0 },
                    width: Number,
                    height: Number,
                    rotation: Number,
                },
            ],
        },
    },
    { timestamps: true }
); // `timestamps: true` automatically adds createdAt and updatedAt

const JournalEntryModel: Model<IJournalEntry> =
    mongoose.models.JournalEntry ||
    mongoose.model<IJournalEntry>('JournalEntry', JournalEntrySchema);

export default JournalEntryModel;
```

### Creating Models

Mongoose models provide an interface to the database for creating, querying, updating, and deleting documents. You import these models into your SvelteKit server files.

## 4. Interacting with MongoDB in SvelteKit

All database operations will occur within server-side SvelteKit files.

### Fetching Data (`load` functions in `+page.server.ts`)

Use the `load` function to query MongoDB and pass data to your Svelte pages.

**Example (`src/routes/journal/+page.server.ts` - List all entries for a user):**

```typescript
// src/routes/journal/+page.server.ts
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { connectToDatabaseMongoose } from '$lib/server/database'; // Assuming Mongoose setup
import JournalEntryModel from '$lib/server/models/JournalEntry';
import type { IJournalEntry } from '$lib/server/models/JournalEntry'; // Import the interface

// Ensure DB connection (could be done at app startup in hooks.server.ts too)
await connectToDatabaseMongoose();

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        throw redirect(303, '/login');
    }

    try {
        const entriesFromDb = await JournalEntryModel.find({
            userId: locals.user.id,
        })
            .sort({ createdAt: -1 }) // Sort by newest first
            .lean(); // .lean() returns plain JS objects, faster and uses less memory

        // Serialize ObjectId to string and ensure data is plain for the client
        const entries = entriesFromDb.map((entry) => ({
            ...entry,
            _id: entry._id.toString(),
            userId: entry.userId.toString(), // If it's an ObjectId
            // Ensure dates are serializable (strings or numbers)
            createdAt: entry.createdAt.toISOString(),
            updatedAt: entry.updatedAt.toISOString(),
        }));

        return {
            entries,
        };
    } catch (err) {
        console.error('Error fetching journal entries:', err);
        return { entries: [], error: 'Could not load entries.' };
    }
};
```

- **`locals.user`**: Assumes you have authentication set up (e.g., via `hooks.server.ts`) and `locals.user` contains the authenticated user's information, including their ID.
- **Serialization:** Data returned from `load` must be serializable (plain JavaScript objects, no complex class instances like Mongoose documents or `Date` objects directly without conversion). Use `.lean()` with Mongoose and convert `ObjectId`s and `Date`s.

### Modifying Data (`actions` in `+page.server.ts`)

Use SvelteKit `actions` to handle form submissions that create, update, or delete MongoDB documents.

**Example (Creating a new entry - from previous SvelteKit explanation, now with Mongoose):**

```typescript
// src/routes/journal/new/+page.server.ts
// ... (imports for Actions, db, models, redirect, fail, locals) ...
import JournalEntryModel from '$lib/server/models/JournalEntry';
await connectToDatabaseMongoose(); // Ensure connection

export const actions: Actions = {
    default: async ({ request, locals }) => {
        if (!locals.user?.id) {
            // Check for user ID specifically
            return fail(401, { message: 'Not authenticated' });
        }
        const formData = await request.formData();
        const title = formData.get('title') as string;
        const content = formData.get('content') as string;
        // ... (get other fields like customizations)

        if (!title || !content) {
            return fail(400, {
                title,
                content,
                message: 'Title and content are required.',
            });
        }

        try {
            const newEntry = new JournalEntryModel({
                title,
                content,
                userId: locals.user.id,
                // ... customizations
            });
            await newEntry.save(); // Mongoose save method

            throw redirect(303, `/journal/${newEntry._id.toString()}`);
        } catch (err: any) {
            // Type error for better handling
            console.error('Error saving entry:', err);
            if (err.name === 'ValidationError') {
                // Mongoose validation error
                return fail(400, {
                    message: 'Validation failed',
                    errors: err.errors,
                });
            }
            return fail(500, { message: 'Failed to save entry.' });
        }
    },
};
```

### API Endpoints (`+server.ts`)

If you need to interact with MongoDB outside of the page load/action flow (e.g., for a "like" button that uses client-side JavaScript `fetch`):

**Example (`src/routes/api/journal/[entryId]/like/+server.ts`):**

```typescript
// src/routes/api/journal/[entryId]/like/+server.ts
import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { connectToDatabaseMongoose } from '$lib/server/database';
import JournalEntryModel from '$lib/server/models/JournalEntry';
await connectToDatabaseMongoose();

export const POST: RequestHandler = async ({ params, locals }) => {
    if (!locals.user?.id) {
        throw error(401, 'Not authenticated');
    }

    const { entryId } = params;

    try {
        // In a real app, you'd likely add to a 'likes' array or increment a counter
        const updatedEntry = await JournalEntryModel.findByIdAndUpdate(
            entryId,
            { $inc: { likeCount: 1 } }, // Example: increment a likeCount field
            { new: true } // Return the updated document
        );

        if (!updatedEntry) {
            throw error(404, 'Entry not found');
        }
        return json({ success: true, likeCount: updatedEntry.likeCount });
    } catch (err) {
        console.error('Error liking entry:', err);
        throw error(500, 'Failed to like entry');
    }
};
```

## 5. Data Validation

- **Mongoose Schemas:** Provide built-in validation (required, type, min/max, enum, regex, custom validators). Mongoose will throw a `ValidationError` if data doesn't conform.
- **Zod (or similar libraries):** For more complex validation or validating data before it even hits Mongoose, especially in `actions` or `+server.ts` handlers. Zod schemas can be defined once and used for both client-side (in Svelte components) and server-side validation.
    - Libraries like `sveltekit-superforms` integrate well with Zod and SvelteKit actions.

## 6. Security Considerations

### User Data Isolation

- **Crucial:** Always ensure that users can only access and modify their own data.
- In every MongoDB query that fetches or modifies user-specific data, include a condition based on the authenticated `locals.user.id`.
    - `JournalEntryModel.find({ userId: locals.user.id, ... })`
    - `JournalEntryModel.findOneAndUpdate({ _id: entryId, userId: locals.user.id }, ...)`

### Input Sanitization

- While Mongoose helps with type casting, be mindful of what you store, especially if rendering content as HTML (`{@html ...}`).
- For user-generated HTML content, use a sanitization library (like `DOMPurify` if processing on the server before save, or ensure your rich text editor outputs safe HTML) to prevent XSS attacks. MongoDB itself doesn't inherently sanitize for XSS.

## 7. Error Handling

- Wrap database operations in `try...catch` blocks.
- Return appropriate error responses from `load`, `actions`, or `+server.ts` functions (e.g., using SvelteKit's `error()` or `fail()` helpers).
- Log database errors on the server for debugging.

## 8. Best Practices

- **Server-Side Only:** All direct database interactions must happen in `*.server.ts` files or modules within `src/lib/server/`.
- **Connection Management:** Establish the database connection efficiently (e.g., on server startup or first request, then reuse).
- **Indexes:** Define indexes on frequently queried fields in your Mongoose schemas (e.g., `userId`, `createdAt`) to improve query performance.
    ```typescript
    // In Mongoose Schema:
    // userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    ```
- **Lean Queries:** Use `.lean()` with Mongoose for read-only operations when you don't need Mongoose document methods, as it improves performance.
- **Serialization:** Ensure data passed from server functions (`load`, `actions`) to the client (`+page.svelte`) is plain serializable JavaScript (convert `ObjectId`s, `Date`s).
- **Environment Variables:** Never hardcode connection strings or sensitive credentials.
- **Transaction Management (Advanced):** For operations that must either all succeed or all fail (e.g., transferring items between two documents), MongoDB supports multi-document ACID transactions. This is an advanced topic but important for data integrity in complex scenarios.
