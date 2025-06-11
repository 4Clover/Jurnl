import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ApiRouter } from '../lib/server/api/apiRouter';
import { error } from '@sveltejs/kit';

describe('ApiRouter', () => {
    let router: ApiRouter;
    let mockEvent: any;

    beforeEach(() => {
        router = new ApiRouter('/api');
        mockEvent = {
            url: new URL('http://localhost:3000/api/test'),
            request: { method: 'GET' },
            locals: { user: { id: 'user123' } },
            params: {}
        };
    });

    describe('Route Registration', () => {
        it('registers GET routes correctly', () => {
            const handler = vi.fn().mockResolvedValue(new Response('OK'));
            router.get('test', handler);

            expect(router['routes'].has('test')).toBe(true);
            expect(router['routes'].get('test')?.has('GET')).toBe(true);
        });

        it('supports method chaining', () => {
            const handler = vi.fn().mockResolvedValue(new Response('OK'));
            
            const result = router
                .get('test1', handler)
                .post('test2', handler)
                .put('test3', handler)
                .delete('test4', handler);

            expect(result).toBe(router);
            expect(router['routes'].size).toBe(4);
        });
    });

    describe('Path Matching', () => {
        it('matches exact paths', async () => {
            const handler = vi.fn().mockResolvedValue(new Response('OK'));
            router.requireAuth(false).get('test', handler);

            await router.handle(mockEvent);
            expect(handler).toHaveBeenCalledWith(mockEvent);
        });

        it('extracts path parameters', async () => {
            const handler = vi.fn().mockResolvedValue(new Response('OK'));
            router.requireAuth(false).get('users/:id', handler);
            
            mockEvent.url = new URL('http://localhost:3000/api/users/123');
            
            await router.handle(mockEvent);
            expect(mockEvent.params.id).toBe('123');
            expect(handler).toHaveBeenCalledWith(mockEvent);
        });

        it('handles multiple parameters', async () => {
            const handler = vi.fn().mockResolvedValue(new Response('OK'));
            router.requireAuth(false).get('journals/:journalId/entries/:entryId', handler);
            
            mockEvent.url = new URL('http://localhost:3000/api/journals/j123/entries/e456');
            
            await router.handle(mockEvent);
            expect(mockEvent.params.journalId).toBe('j123');
            expect(mockEvent.params.entryId).toBe('e456');
        });
    });

    describe('Authentication', () => {
        it('allows requests when auth not required', async () => {
            const handler = vi.fn().mockResolvedValue(new Response('OK'));
            router.requireAuth(false).get('test', handler);
            mockEvent.locals.user = null;

            await router.handle(mockEvent);
            expect(handler).toHaveBeenCalled();
        });

        it('blocks requests when auth required and user not authenticated', async () => {
            const handler = vi.fn().mockResolvedValue(new Response('OK'));
            router.requireAuth(true).get('test', handler);
            mockEvent.locals.user = null;

            await expect(router.handle(mockEvent)).rejects.toThrow();
        });

        it('allows authenticated requests when auth required', async () => {
            const handler = vi.fn().mockResolvedValue(new Response('OK'));
            router.requireAuth(true).get('test', handler);

            await router.handle(mockEvent);
            expect(handler).toHaveBeenCalled();
        });
    });

    describe('Error Handling', () => {
        it('returns 404 for unknown routes', async () => {
            router.requireAuth(false).get('other', vi.fn());
            
            await expect(router.handle(mockEvent)).rejects.toThrow();
        });

        it('returns 405 for unsupported methods', async () => {
            router.requireAuth(false).get('test', vi.fn());
            mockEvent.request.method = 'POST';
            
            await expect(router.handle(mockEvent)).rejects.toThrow();
        });
    });

    describe('Base Path Handling', () => {
        it('strips base path correctly', async () => {
            const handler = vi.fn().mockResolvedValue(new Response('OK'));
            router.requireAuth(false).get('test', handler);
            
            mockEvent.url = new URL('http://localhost:3000/api/test');
            
            await router.handle(mockEvent);
            expect(handler).toHaveBeenCalled();
        });

        it('handles base path with trailing slash', async () => {
            const handler = vi.fn().mockResolvedValue(new Response('OK'));
            router.requireAuth(false).get('test', handler);
            
            mockEvent.url = new URL('http://localhost:3000/api/test/');
            
            await router.handle(mockEvent);
            expect(handler).toHaveBeenCalled();
        });
    });
});