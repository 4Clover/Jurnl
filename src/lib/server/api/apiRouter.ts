import type { RequestEvent } from '@sveltejs/kit';
import { json, error } from '@sveltejs/kit';
import { journalService, entryService, userService } from './index';
import { journalServiceWithEntries } from './journal.service';
import { seedTestUsers, clearTestData } from '../database/seed-dev-data';
import {
    addFriendFromForm,
    addFriendValidated,
    deleteFriendByUsername,
    getFriendUsernames,
    getFriendsPublicEntries,
    getUserSharedEntries,
} from './friend.service';
import { dev } from '$app/environment';

type RouteHandler = (event: RequestEvent) => Promise<Response>;

export class ApiRouter {
    private routes = new Map<string, Map<string, RouteHandler>>();
    private authRequired = true;

    constructor(private basePath = '/api') {}

    requireAuth(required = true) {
        this.authRequired = required;
        return this;
    }

    on(method: string, path: string, handler: RouteHandler) {
        if (!this.routes.has(path)) {
            this.routes.set(path, new Map());
        }
        this.routes.get(path)!.set(method, handler);
        return this;
    }

    get = (path: string, handler: RouteHandler) =>
        this.on('GET', path, handler);
    post = (path: string, handler: RouteHandler) =>
        this.on('POST', path, handler);
    put = (path: string, handler: RouteHandler) =>
        this.on('PUT', path, handler);
    delete = (path: string, handler: RouteHandler) =>
        this.on('DELETE', path, handler);

    async handle(event: RequestEvent): Promise<Response> {
        const path = event.url.pathname.replace(
            new RegExp(`^${this.basePath}/?`),
            '',
        );

        if (this.authRequired && !event.locals.user) {
            error(401, 'Unauthorized');
        }

        for (const [routePath, methods] of this.routes) {
            const params = this.matchPath(path, routePath);
            if (params !== null) {
                const handler = methods.get(event.request.method);
                if (!handler) {
                    error(405, `Method ${event.request.method} not allowed`);
                }

                event.params = { ...event.params, ...params };
                return handler(event);
            }
        }

        error(404, 'Route not found');
    }

    private matchPath(
        actual: string,
        pattern: string,
    ): Record<string, string> | null {
        const actualParts = actual.split('/').filter(Boolean);
        const patternParts = pattern.split('/').filter(Boolean);

        if (actualParts.length !== patternParts.length) return null;

        const params: Record<string, string> = {};

        for (let i = 0; i < patternParts.length; i++) {
            const patternPart = patternParts[i];
            const actualPart = actualParts[i];

            if (patternPart?.startsWith(':')) {
                if (!patternPart || !actualPart) return null;
                params[patternPart.slice(1)] = actualPart;
            } else if (patternPart !== actualPart) {
                return null;
            }
        }

        return params;
    }
}

export const api = new ApiRouter()
    .requireAuth()

    .get('test', async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return json({
            message: 'API router test successful!',
            timestamp: new Date().toISOString(),
        });
    })

    .get('journals', (event) => {
        const url = new URL(event.request.url);
        const withEntries = url.searchParams.get('withEntries') === 'true';

        if (withEntries) {
            return journalServiceWithEntries.listWithRecentEntries(event, {
                user: event.locals.user!.id,
            });
        } else {
            return journalService.list(event, { user: event.locals.user!.id });
        }
    })
    .post('journals', (event) => journalService.create(event))
    .get('journals/:id', (event) => journalService.get(event, event.params.id!))
    .put('journals/:id', (event) =>
        journalService.update(event, event.params.id!),
    )
    .delete('journals/:id', (event) =>
        journalService.delete(event, event.params.id!),
    )

    .get('journals/:journalId/entries', (event) =>
        entryService.listByJournal(event, event.params.journalId!),
    )
    .post('journals/:journalId/entries', (event) => {
        event.params.journal = event.params.journalId!;
        return entryService.create(event);
    })
    .get('journals/:journalId/entries/:entryId', (event) =>
        entryService.get(event, event.params.entryId!),
    )
    .put('journals/:journalId/entries/:entryId', (event) =>
        entryService.update(event, event.params.entryId!),
    )
    .delete('journals/:journalId/entries/:entryId', (event) =>
        entryService.delete(event, event.params.entryId!),
    )

    .get('users/:id', (event) => userService.get(event, event.params.id!))
    .put('users/:id', (event) => userService.update(event, event.params.id!))

    .get('friends/entries', async (event) => {
        const result = await getFriendsPublicEntries(event);
        return json(result.result);
    })
    .get('friends/shared', async (event) => {
        const result = await getUserSharedEntries(event);
        return json(result);
    })
    .get('friends', async (event) => {
        const result = await getFriendUsernames(event);
        return json(result.result);
    })
    .post('friends', async (event) => {
        const contentType = event.request.headers.get('content-type');

        if (contentType?.includes('application/json')) {
            const body = await event.request.json();
            const result = await addFriendValidated(event, body);
            return json(result);
        } else {
            const formData = await event.request.formData();
            const result = await addFriendFromForm(event, formData);
            return json(result);
        }
    })
    .delete('friends/:username', async (event) => {
        const result = await deleteFriendByUsername(
            event,
            event.params.username!,
        );
        return json(result);
    })

    .get('stats', async (event) => {
        const userId = event.locals.user!.id;
        const { Journal, Entry } = await import('../database/schemas');
        const [journalCount, entryCount] = await Promise.all([
            Journal.countDocuments({ user: userId }),
            Entry.countDocuments({ user: userId }),
        ]);

        return json({
            totalJournals: journalCount,
            totalEntries: entryCount,
            user: event.locals.user,
        });
    })

    .post('dev/seed', async (event) => {
        if (!dev) {
            error(403, 'Development endpoints only available in dev mode');
        }

        try {
            const currentUserId = event.locals.user?.id;
            await seedTestUsers(currentUserId);
            return json({
                success: true,
                message: 'Test users seeded successfully',
                users: [
                    'alice_writer',
                    'bob_traveler',
                    'charlie_dev',
                    'diana_artist',
                ],
                friendsAdded: !!currentUserId,
                sharedEntriesCreated: !!currentUserId,
            });
        } catch (err) {
            error(
                500,
                `Seeding failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
            );
        }
    })
    .delete('dev/seed', async () => {
        if (!dev) {
            error(403, 'Development endpoints only available in dev mode');
        }

        try {
            await clearTestData();
            return json({
                success: true,
                message: 'Test data cleared successfully',
            });
        } catch (err) {
            error(
                500,
                `Clear failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
            );
        }
    });
