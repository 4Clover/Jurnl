import type { Handle, HandleServerError } from '@sveltejs/kit';
import { dev } from '$app/environment';
import connectToDatabase, { isDatabaseConnected } from '$lib/server/database/database';
import { refreshSession, validateClientSessionToken } from '$lib/server/auth/sessionManager';
import {
    SESSION_COOKIE_NAME,
    setSessionCookie,
} from '$lib/server/auth/cookies';
import '$lib/server/database/shutdown';

/**
 * Handles session validation for incoming requests and populates event.locals.
 */
export const handle: Handle = async ({ event, resolve }) => {
    try {
        await connectToDatabase();
    } catch (error) {
        console.error('DB connection failed in handle hook:', error);
        // locals to null and continue without blocking
        event.locals.user = null;
        event.locals.session = null;
        return resolve(event);
    }

    // ======== ROUTE LOGGER =========
    if (dev && event.route.id) {
        const filePath = `src/routes${event.route.id}`;
        console.log(`📍 [${event.request.method}] ${event.url.pathname} → ${filePath}`);
    }

    const clientToken = event.cookies.get(SESSION_COOKIE_NAME);

    if (clientToken) {
        // validate session if database is connected
        if (!isDatabaseConnected()) {
            console.warn('Database not connected, skipping session validation');
            event.locals.user = null;
            event.locals.session = null;
            return resolve(event);
        }
        
        const validationResult = await validateClientSessionToken(clientToken);

        if (validationResult.user && validationResult.session) {
            // assign the serializable user and session data to locals
            event.locals.user = validationResult.user;
            event.locals.session = validationResult.session;

            // refresh session cookie
            const newExpiry = await refreshSession(validationResult.session._id);
            if (newExpiry) {
                setSessionCookie(event, clientToken, newExpiry);
            }

        } else {
            // invalid or expired token so clear locals
            event.locals.user = null;
            event.locals.session = null;
        }
    } else {
        // no client token found
        event.locals.user = null;
        event.locals.session = null;
    }

    return resolve(event); // finally, resolve the request
};

/**
 * Error handling for server-side errors.
 */
export const handleError: HandleServerError = ({ error, event }) => {
    // generate unique id for error -- useful if saved to a log file
    const errorId = crypto.randomUUID();

    // log error to the server console
    console.error(`--------------------------------`);
    console.error(`Error ID: ${errorId}`);
    console.error(`Timestamp: ${new Date().toISOString()}`);
    console.error(`Route ID: ${event.route.id}`);
    console.error(`URL: ${event.url.pathname}${event.url.search}`);
    console.error('Error Object:', error); // object and stack
    if (error instanceof Error && error.cause) {
        console.error('Error Cause:', error.cause);
    }
    console.error(`--------------------------------`);

    // prep error object for client viewing
    const clientError: App.Error = {
        message: `An unexpected error occurred. Please try again.`,
        code: errorId,
    };

    if (dev) {
        // in dev: more details
        clientError.message =
            (error instanceof Error ? error.message : String(error)) +
            ` (Ref: ${errorId})`;
        if (error instanceof Error && 'code' in error && error.code) {
            clientError.code = error.code as string;
        }
        const errorWithStack = clientError as App.Error & { stack?: string };
        errorWithStack.stack = error instanceof Error ? error.stack : undefined;
    }

    return clientError;
};
