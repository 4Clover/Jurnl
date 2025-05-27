// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type {
    SerializableUser,
    SerializableSession,
} from '$lib/server/database/schemas';

declare global {
    namespace App {
        interface Error {
            message: string; // default svelte
            code?: string; // custom error codes
            stack?: string; // stack dump for error logs
        }
        interface Locals {
            user: SerializableUser | null;
            session: SerializableSession | null;
        }
        // interface PageData {}
        // interface Platform {}
    }
}

export {};
