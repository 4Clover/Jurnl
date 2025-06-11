import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { redirect } from '@sveltejs/kit';
vi.mock('@sveltejs/kit', () => ({
    redirect: vi.fn(() => {
        throw new Error('redirect called');
    })
}));

describe('Login Page Server', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Load Function', () => {
        it('redirects authenticated users to landing page', async () => {
            const { load } = await import('../routes/auth/login/+page.server');
            
            const mockEvent = {
                locals: {
                    user: { id: 'user123', username: 'testuser' }
                },
                url: new URL('http://localhost:3000/auth/login'),
                params: {},
                route: { id: '/auth/login' },
                cookies: {} as any,
                fetch: {} as any,
                getClientAddress: vi.fn(),
                request: {} as any,
                setHeaders: vi.fn(),
                depends: vi.fn(),
                parent: vi.fn(),
                untrack: vi.fn(),
                isDataRequest: false,
                isSubRequest: false
            } as any;

            await expect(async () => await load(mockEvent)).rejects.toThrow('redirect called');
            expect(redirect).toHaveBeenCalledWith(303, '/landing');
        });

        it('redirects authenticated users to intended destination', async () => {
            const { load } = await import('../routes/auth/login/+page.server');
            
            const mockEvent = {
                locals: {
                    user: { id: 'user123', username: 'testuser' }
                },
                url: new URL('http://localhost:3000/auth/login?redirectTo=/journals'),
                params: {},
                route: { id: '/auth/login' },
                cookies: {} as any,
                fetch: {} as any,
                getClientAddress: vi.fn(),
                request: {} as any,
                setHeaders: vi.fn(),
                depends: vi.fn(),
                parent: vi.fn(),
                untrack: vi.fn(),
                isDataRequest: false,
                isSubRequest: false
            } as any;

            await expect(async () => await load(mockEvent)).rejects.toThrow('redirect called');
            expect(redirect).toHaveBeenCalledWith(303, '/journals');
        });

        it('returns redirect parameter for unauthenticated users', async () => {
            const { load } = await import('../routes/auth/login/+page.server');
            
            const mockEvent = {
                locals: {},
                url: new URL('http://localhost:3000/auth/login?redirectTo=/journals'),
                params: {},
                route: { id: '/auth/login' },
                cookies: {} as any,
                fetch: {} as any,
                getClientAddress: vi.fn(),
                request: {} as any,
                setHeaders: vi.fn(),
                depends: vi.fn(),
                parent: vi.fn(),
                untrack: vi.fn(),
                isDataRequest: false,
                isSubRequest: false
            } as any;

            const result = await load(mockEvent);
            expect(result).toEqual({ redirectTo: '/journals' });
        });

        it('returns null redirectTo when no parameter provided', async () => {
            const { load } = await import('../routes/auth/login/+page.server');
            
            const mockEvent = {
                locals: {},
                url: new URL('http://localhost:3000/auth/login'),
                params: {},
                route: { id: '/auth/login' },
                cookies: {} as any,
                fetch: {} as any,
                getClientAddress: vi.fn(),
                request: {} as any,
                setHeaders: vi.fn(),
                depends: vi.fn(),
                parent: vi.fn(),
                untrack: vi.fn(),
                isDataRequest: false,
                isSubRequest: false
            } as any;

            const result = await load(mockEvent);
            expect(result).toEqual({ redirectTo: null });
        });
    });
});