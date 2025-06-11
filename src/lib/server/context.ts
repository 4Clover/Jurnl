/**
 * Request Context Manager
 * Manages request-scoped context for logging and tracing
 */

import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';
import type { LogContext } from '$lib/types/logger.types';
import type { RequestEvent } from '@sveltejs/kit';

// AsyncLocalStorage instance for request context
const contextStorage = new AsyncLocalStorage<LogContext>();

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
    return randomUUID();
}

/**
 * Extract context from a SvelteKit request event
 */
export function extractRequestContext(event: RequestEvent): LogContext {
    const context: LogContext = {
        requestId: generateRequestId(),
        method: event.request.method,
        path: event.url.pathname,
        query: event.url.search,
    };

    // Add user context if available
    if (event.locals.user) {
        context.userId = event.locals.user.id;
        context.username = event.locals.user.username;
    }

    // Add session context if available
    if (event.locals.session) {
        context.sessionId = event.locals.session._id;
    }

    // Add request headers context
    const userAgent = event.request.headers.get('user-agent');
    if (userAgent) {
        context.userAgent = userAgent;
    }

    // Add IP address (considering proxies)
    const forwardedFor = event.request.headers.get('x-forwarded-for');
    const realIp = event.request.headers.get('x-real-ip');
    const ip =
        forwardedFor?.split(',')[0]?.trim() ||
        realIp ||
        event.getClientAddress();
    if (ip) {
        context.ip = ip;
    }

    return context;
}

/**
 * Run a function with a specific context
 */
export function runWithContext<T>(
    context: LogContext,
    fn: () => T | Promise<T>,
): T | Promise<T> {
    return contextStorage.run(context, fn);
}

/**
 * Get the current request context
 */
export function getContext(): LogContext | undefined {
    return contextStorage.getStore();
}

/**
 * Get a specific value from the current context
 */
export function getContextValue<K extends keyof LogContext>(
    key: K,
): LogContext[K] | undefined {
    const context = getContext();
    return context?.[key];
}

/**
 * Update the current context with additional values
 */
export function updateContext(updates: Partial<LogContext>): void {
    const currentContext = getContext();
    if (currentContext) {
        Object.assign(currentContext, updates);
    }
}

/**
 * Create a child context with additional values
 */
export function createChildContext(
    additionalContext: Partial<LogContext>,
): LogContext {
    const currentContext = getContext() || {};
    return {
        ...currentContext,
        ...additionalContext,
    };
}

/**
 * Middleware to attach context to SvelteKit requests
 */
export function attachRequestContext(event: RequestEvent): void {
    const context = extractRequestContext(event);

    // Store context in event.locals for easy access
    event.locals.logContext = context;

    // Make context available via AsyncLocalStorage
    runWithContext(context, () => {
        // The actual request handling will happen within this context
    });
}

/**
 * Performance timer that includes context
 */
export class ContextTimer {
    private startTime: number;
    private context: LogContext;

    constructor(operationName?: string) {
        this.startTime = performance.now();
        this.context = getContext() || {};
        if (operationName) {
            this.context.operation = operationName;
        }
    }

    end(): { duration: number; context: LogContext } {
        const duration = Math.round(performance.now() - this.startTime);
        return {
            duration,
            context: this.context,
        };
    }
}

/**
 * Decorator for adding context to async functions
 */
export function withContext(additionalContext: Partial<LogContext>) {
    return function <
        T extends { [K: string]: (...args: unknown[]) => unknown },
    >(target: T, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value as (
            ...args: unknown[]
        ) => unknown;

        descriptor.value = async function (this: T, ...args: unknown[]) {
            const context = createChildContext(additionalContext);
            return runWithContext(context, () =>
                originalMethod.apply(this, args),
            );
        };

        return descriptor;
    };
}

/**
 * Helper to create a logger with current request context
 */
export function createContextualLogger() {
    const context = getContext();
    if (!context) {
        throw new Error('No request context available');
    }

    // This will be used when integrating with the logger
    return {
        context,
        requestId: context.requestId,
    };
}
