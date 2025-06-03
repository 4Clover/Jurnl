import type { RequestEvent } from '@sveltejs/kit';
import { error, json } from '@sveltejs/kit';
import { journalService, entryService, userService } from './index';

// Simple but powerful router implementation
export class ApiRouter {
    private routes = new Map<string, Map<string, Function>>();
    private middleware: Function[] = [];

    constructor(private basePath = '/api') {}

    // Add middleware
    use(fn: (event: RequestEvent) => void | Promise<void>) {
        this.middleware.push(fn);
        return this;
    }

    // Register route
    on(method: string, path: string, handler: Function) {
        const key = `${method}:${path}`;
        if (!this.routes.has(path)) {
            this.routes.set(path, new Map());
        }
        this.routes.get(path)!.set(method, handler);
        return this;
    }

    // Convenience methods
    get = (path: string, handler: Function) => this.on('GET', path, handler);
    post = (path: string, handler: Function) => this.on('POST', path, handler);
    put = (path: string, handler: Function) => this.on('PUT', path, handler);
    delete = (path: string, handler: Function) => this.on('DELETE', path, handler);

    // Match and handle request
    async handle(event: RequestEvent): Promise<Response> {
        // Remove base path
        const path = event.url.pathname.replace(new RegExp(`^${this.basePath}/?`), '');

        // Run middleware
        for (const mw of this.middleware) {
            await mw(event);
        }

        // Try exact match first
        for (const [routePath, methods] of this.routes) {
            const params = this.matchPath(path, routePath);
            if (params !== null) {
                const handler = methods.get(event.request.method);
                if (!handler) {
                    throw error(405, `Method ${event.request.method} not allowed`);
                }

                // Add params to event
                event.params = { ...event.params, ...params };
                return handler(event);
            }
        }

        throw error(404, 'Route not found');
    }

    // Simple path matching with params
    private matchPath(actual: string, pattern: string): Record<string, string> | null {
        const actualParts = actual.split('/').filter(Boolean);
        const patternParts = pattern.split('/').filter(Boolean);

        if (actualParts.length !== patternParts.length) return null;

        const params: Record<string, string> = {};

        for (let i = 0; i < patternParts.length; i++) {
            const patternPart = patternParts[i];
            const actualPart = actualParts[i];

            // @ts-ignore
            if (patternPart.startsWith(':')) {
                // parameter
                // @ts-ignore
                params[patternPart.slice(1)] = actualPart;
            } else if (patternPart !== actualPart) {
                // no match
                return null;
            }
        }

        return params;
    }
}

// Create the main API router with all routes
export const api = new ApiRouter()
    // Global middleware
    .use(async (event) => {
        // Check auth for all routes
        if (!event.locals.user) {
            throw error(401, 'Unauthorized');
        }
    })

    // ===== JOURNALS =====
    .get(
        'journals',
        async (
            event: RequestEvent<Partial<Record<string, string>>, string | null>,
        ) => {
            return journalService.list(event, { user: event.locals.user!.id });
        },
    )
    .post(
        'journals',
        async (
            event: RequestEvent<Partial<Record<string, string>>, string | null>,
        ) => {
            return journalService.create(event);
        },
    )
    .get(
        'journals/:id',
        async (
            event: RequestEvent<Partial<Record<string, string>>, string | null>,
        ) => {
            return journalService.get(event, event.params.id!);
        },
    )
    .put(
        'journals/:id',
        async (
            event: RequestEvent<Partial<Record<string, string>>, string | null>,
        ) => {
            return journalService.update(event, event.params.id!);
        },
    )
    .delete(
        'journals/:id',
        async (
            event: RequestEvent<Partial<Record<string, string>>, string | null>,
        ) => {
            return journalService.delete(event, event.params.id!);
        },
    )

    // ===== ENTRIES =====
    .get(
        'journals/:journalId/entries',
        async (
            event: RequestEvent<Partial<Record<string, string>>, string | null>,
        ) => {
            const journalId = event.params.journalId!;
            return entryService.listByJournal(event, journalId);
        },
    )
    .post(
        'journals/:journalId/entries',
        async (
            event: RequestEvent<Partial<Record<string, string>>, string | null>,
        ) => {
            const journalId = event.params.journalId!;
            event.params = { ...event.params, journal: journalId };
            return entryService.create(event);
        },
    )
    .get(
        'journals/:journalId/entries/:entryId',
        async (
            event: RequestEvent<Partial<Record<string, string>>, string | null>,
        ) => {
            return entryService.get(event, event.params.entryId!);
        },
    )
    .put(
        'journals/:journalId/entries/:entryId',
        async (
            event: RequestEvent<Partial<Record<string, string>>, string | null>,
        ) => {
            return entryService.update(event, event.params.entryId!);
        },
    )
    .delete(
        'journals/:journalId/entries/:entryId',
        async (
            event: RequestEvent<Partial<Record<string, string>>, string | null>,
        ) => {
            return entryService.delete(event, event.params.entryId!);
        },
    )

    // ===== USERS =====
    .get(
        'users/:id',
        async (
            event: RequestEvent<Partial<Record<string, string>>, string | null>,
        ) => {
            return userService.get(event, event.params.id!);
        },
    )
    .put(
        'users/:id',
        async (
            event: RequestEvent<Partial<Record<string, string>>, string | null>,
        ) => {
            return userService.update(event, event.params.id!);
        },
    )

// ============================================
// USAGE: Create a single catch-all route file
// ============================================
// src/routes/api/[...path]/+server.ts
/*
import type { RequestHandler } from '@sveltejs/kit';
import { api } from '$lib/server/api/completeApiSetup';

const handler: RequestHandler = (event) => api.handle(event);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
*/

// ============================================
// Alternative: Group routers for organization
// ============================================
export class RouterGroup {
    constructor(
        private prefix: string,
        private parent: ApiRouter
    ) {}

    get = (path: string, handler: Function) => {
        this.parent.get(`${this.prefix}${path}`, handler);
        return this;
    }

    post = (path: string, handler: Function) => {
        this.parent.post(`${this.prefix}${path}`, handler);
        return this;
    }

    put = (path: string, handler: Function) => {
        this.parent.put(`${this.prefix}${path}`, handler);
        return this;
    }

    delete = (path: string, handler: Function) => {
        this.parent.delete(`${this.prefix}${path}`, handler);
        return this;
    }

    group(prefix: string): RouterGroup {
        return new RouterGroup(`${this.prefix}${prefix}`, this.parent);
    }
}

// Example with groups (cleaner for large APIs):
export const groupedApi = new ApiRouter()
    .use(async (event) => {
        if (!event.locals.user) throw error(401);
    });

// Journal routes group
const journals = new RouterGroup('journals', groupedApi);
journals
    .get(
        '',
        async (
            event: RequestEvent,
        ) => journalService.list(event, { user: event.locals.user!.id }),
    )
    .post(
        '',
        async (
            event: RequestEvent<Partial<Record<string, string>>, string | null>,
        ) => journalService.create(event),
    )
    .get(
        '/:id',
        async (
            event: RequestEvent<Partial<Record<string, string>>, string | null>,
        ) => journalService.get(event, event.params.id!),
    )
    .put(
        '/:id',
        async (
            event: RequestEvent<Partial<Record<string, string>>, string | null>,
        ) => journalService.update(event, event.params.id!),
    )
    .delete(
        '/:id',
        async (
            event: RequestEvent<Partial<Record<string, string>>, string | null>,
        ) => journalService.delete(event, event.params.id!),
    );

// Entry routes subgroup
const entries = journals.group('/:journalId/entries');
entries
    .get(
        '',
        async (
            event: RequestEvent<Partial<Record<string, string>>, string | null>,
        ) => entryService.listByJournal(event, event.params.journalId!),
    )
    .post(
        '',
        async (
            event: RequestEvent<Partial<Record<string, string>>, string | null>,
        ) => {
            event.params.journal = event.params.journalId;
            return entryService.create(event);
        },
    )
    .get(
        '/:entryId',
        async (
            event: RequestEvent<Partial<Record<string, string>>, string | null>,
        ) => entryService.get(event, event.params.entryId!),
    )
    .put(
        '/:entryId',
        async (
            event: RequestEvent<Partial<Record<string, string>>, string | null>,
        ) => entryService.update(event, event.params.entryId!),
    )
    .delete(
        '/:entryId',
        async (
            event: RequestEvent<Partial<Record<string, string>>, string | null>,
        ) => entryService.delete(event, event.params.entryId!),
    );