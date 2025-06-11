// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type {
    SerializableUser,
    SerializableSession,
} from '$lib/server/database/schemas';
import type { LogContext } from '$lib/types/logger.types';

declare global {
    namespace App {
        interface Error {
            message: string; // default svelte
            code?: string; // custom error codes
            status?: number; // HTTP status code
            details?: Record<string, unknown>; // additional error context
        }
        interface Locals {
            user: SerializableUser | null;
            session: SerializableSession | null;
            logContext?: LogContext;
        }
        // interface PageData {}
        // interface Platform {}
    }
}

export {};
