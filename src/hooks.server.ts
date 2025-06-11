import type { Handle, HandleServerError } from '@sveltejs/kit';
import { dev } from '$app/environment';
import connectToDatabase, {
    isDatabaseConnected,
} from '$lib/server/database/database';
import {
    refreshSession,
    validateClientSessionToken,
} from '$lib/server/auth/sessionManager';
import {
    SESSION_COOKIE_NAME,
    setSessionCookie,
} from '$lib/server/auth/cookies';
import '$lib/server/database/shutdown';
import { logger } from '$lib/server/logger';
import { extractRequestContext, runWithContext } from '$lib/server/context';
import { performance } from 'perf_hooks';

/**
 * Handles session validation for incoming requests and populates event.locals.
 */
export const handle: Handle = async ({ event, resolve }) => {
    // Extract request context for logging
    const context = extractRequestContext(event);
    event.locals.logContext = context;

    // Run the entire request within the logging context
    return runWithContext(context, async () => {
        const requestLogger = logger.child(context);
        const startTime = performance.now();

        try {
            await connectToDatabase();
        } catch (error) {
            requestLogger.error(
                'Database connection failed in handle hook',
                error,
            );
            // locals to null and continue without blocking
            event.locals.user = null;
            event.locals.session = null;
            return resolve(event);
        }

        // ======== ROUTE LOGGER =========
        if (dev && event.route.id) {
            const filePath = `src/routes${event.route.id}`;
            requestLogger.debug(`Route mapped`, {
                method: event.request.method,
                path: event.url.pathname,
                file: filePath,
            });
        }

        const clientToken = event.cookies.get(SESSION_COOKIE_NAME);

        if (clientToken) {
            // validate session if database is connected
            if (!isDatabaseConnected()) {
                requestLogger.warn(
                    'Database not connected, skipping session validation',
                );
                event.locals.user = null;
                event.locals.session = null;
                return resolve(event);
            }

            const validationResult =
                await validateClientSessionToken(clientToken);

            if (validationResult.user && validationResult.session) {
                // assign the serializable user and session data to locals
                event.locals.user = validationResult.user;
                event.locals.session = validationResult.session;

                // refresh session cookie
                const newExpiry = await refreshSession(
                    validationResult.session._id,
                );
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

        const response = await resolve(event);

        // Log request completion with appropriate level based on status code
        const duration = Math.round(performance.now() - startTime);
        const logData = {
            status: response.status,
            user: event.locals.user?.username,
            duration: `${duration}ms`,
        };

        if (response.status >= 500) {
            // 5xx: Server errors
            requestLogger.error(
                `Request completed with server error`,
                undefined,
                logData,
            );
        } else if (response.status >= 400) {
            // 4xx: Client errors (400, 401, 403, 404, 405, etc.)
            requestLogger.warn(`Request completed with client error`, logData);
        } else if (response.status >= 300) {
            // 3xx: Redirects
            requestLogger.info(`Request completed with redirect`, logData);
        } else {
            // 2xx: Success
            requestLogger.info(`Request completed successfully`, logData);
        }

        return response;
    });
};

/**
 * Error handling for server-side errors.
 */
export const handleError: HandleServerError = ({ error, event }) => {
    // generate unique id for error -- useful if saved to a log file
    const errorId = crypto.randomUUID();

    // Use the logger with request context
    const errorLogger = logger.child({
        ...event.locals.logContext,
        errorId,
        route: event.route.id,
        url: `${event.url.pathname}${event.url.search}`,
    });

    // Log the error with full context
    errorLogger.fatal('Unhandled server error', error, {
        userAgent: event.request.headers.get('user-agent'),
        referrer: event.request.headers.get('referer'),
        method: event.request.method,
    });

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
