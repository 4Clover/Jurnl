import type { RequestEvent } from '@sveltejs/kit';
import { error, json } from '@sveltejs/kit';
import { journalService, entryService, userService } from './index';

export class ApiRouter {
    private routes = new Map<string, Map<string, Function>>();
    private middleware: Function[] = [];

    constructor(private basePath = '/api') {}

    // Middleware
    use(fn: (event: RequestEvent) => void | Promise<void>) {
        this.middleware.push(fn);
        return this;
    }


    // Register route
    on(method: string, path: string, handler: Function) {
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

    // Path matching with params
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

    .get('test', async () => {
        return json({
            message: 'API router test successful!',
            timestamp: new Date().toISOString()
        });
    })

    // ===== JOURNALS =====
    .get(
        'journals',
        async (
            event: RequestEvent,
        ) => {
            return journalService.list(event, { user: event.locals.user!.id });
        },
    )
    .post(
        'journals',
        async (
            event: RequestEvent,
        ) => {
            return journalService.create(event);
        },
    )
    .get(
        'journals/:id',
        async (
            event: RequestEvent,
        ) => {
            return journalService.get(event, event.params.id!);
        },
    )
    .put(
        'journals/:id',
        async (
            event: RequestEvent,
        ) => {
            return journalService.update(event, event.params.id!);
        },
    )
    .delete(
        'journals/:id',
        async (
            event: RequestEvent,
        ) => {
            return journalService.delete(event, event.params.id!);
        },
    )

    // ===== ENTRIES =====
    .get(
        'journals/:journalId/entries',
        async (
            event: RequestEvent,
        ) => {
            const journalId = event.params.journalId!;
            return entryService.listByJournal(event, journalId);
        },
    )
    .post(
        'journals/:journalId/entries',
        async (
            event: RequestEvent,
        ) => {
            const journalId = event.params.journalId!;
            event.params = { ...event.params, journal: journalId };
            return entryService.create(event);
        },
    )
    .get(
        'journals/:journalId/entries/:entryId',
        async (
            event: RequestEvent,
        ) => {
            return entryService.get(event, event.params.entryId!);
        },
    )
    .put(
        'journals/:journalId/entries/:entryId',
        async (
            event: RequestEvent,
        ) => {
            return entryService.update(event, event.params.entryId!);
        },
    )
    .delete(
        'journals/:journalId/entries/:entryId',
        async (
            event: RequestEvent,
        ) => {
            return entryService.delete(event, event.params.entryId!);
        },
    )

    // ===== USERS =====
    .get(
        'users/:id',
        async (
            event: RequestEvent,
        ) => {
            return userService.get(event, event.params.id!);
        },
    )
    .put(
        'users/:id',
        async (
            event: RequestEvent,
        ) => {
            return userService.update(event, event.params.id!);
        },
    )


    .get(
        'stats',
        async (
            event: RequestEvent,
        ) => {
            // Get the responses
            const [journalsResponse, entriesResponse] = await Promise.all([
                journalService.list(event, { user: event.locals.user!.id }),
                entryService.list(event, { user: event.locals.user!.id }),
            ]);

            // Parse the JSON from the responses
            const journals = await journalsResponse.json();
            const entries = await entriesResponse.json();

            return json({
                totalJournals: journals.length,
                totalEntries: entries.length,
                user: event.locals.user,
            });
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
            event: RequestEvent,
        ) => journalService.create(event),
    )
    .get(
        '/:id',
        async (
            event: RequestEvent,
        ) => journalService.get(event, event.params.id!),
    )
    .put(
        '/:id',
        async (
            event: RequestEvent,
        ) => journalService.update(event, event.params.id!),
    )
    .delete(
        '/:id',
        async (
            event: RequestEvent,
        ) => journalService.delete(event, event.params.id!),
    );

// Entry routes subgroup
const entries = journals.group('/:journalId/entries');
entries
    .get(
        '',
        async (
            event: RequestEvent,
        ) => entryService.listByJournal(event, event.params.journalId!),
    )
    .post(
        '',
        async (
            event: RequestEvent,
        ) => {
            event.params.journal = event.params.journalId;
            return entryService.create(event);
        },
    )
    .get(
        '/:entryId',
        async (
            event: RequestEvent,
        ) => entryService.get(event, event.params.entryId!),
    )
    .put(
        '/:entryId',
        async (
            event: RequestEvent,
        ) => entryService.update(event, event.params.entryId!),
    )
    .delete(
        '/:entryId',
        async (
            event: RequestEvent,
        ) => entryService.delete(event, event.params.entryId!),
    );