import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { redirect } from '@sveltejs/kit';

// Mock all dependencies
vi.mock('$lib/server/database/database', () => ({
    default: vi.fn()
}));

vi.mock('$lib/server/auth/cookies', () => ({
    deleteSessionCookie: vi.fn(),
    SESSION_COOKIE_NAME: 'session'
}));

vi.mock('$lib/server/auth/sessionManager', () => ({
    invalidateSessionByClientToken: vi.fn()
}));

describe('Logout Testing', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('redirects to login after logout', async () => {
        const { POST } = await import('../routes/auth/logout/+server');
        const { deleteSessionCookie } = await import('$lib/server/auth/cookies');
        const connectToDatabase = await import('$lib/server/database/database');
        
        vi.mocked(connectToDatabase.default).mockResolvedValue(undefined);
        vi.mocked(deleteSessionCookie).mockImplementation(() => {});
        
        const mockEvent = {
            cookies: {
                get: vi.fn().mockReturnValue(undefined),
                delete: vi.fn()
            },
            locals: {}
        };

        try {
            await POST(mockEvent);
            expect.fail('Expected redirect to be thrown');
        } catch (error: any) {
            expect(error.status).toBe(303);
            expect(error.location).toBe('/auth/login');
        }
        
        expect(deleteSessionCookie).toHaveBeenCalledWith(mockEvent);
    });

    it('handles logout with valid session token', async () => {
        const { POST } = await import('../routes/auth/logout/+server');
        const { deleteSessionCookie, SESSION_COOKIE_NAME } = await import('$lib/server/auth/cookies');
        const { invalidateSessionByClientToken } = await import('$lib/server/auth/sessionManager');
        const connectToDatabase = await import('$lib/server/database/database');
        
        const mockToken = 'valid-session-token';
        
        vi.mocked(connectToDatabase.default).mockResolvedValue(undefined);
        vi.mocked(deleteSessionCookie).mockImplementation(() => {});
        vi.mocked(invalidateSessionByClientToken).mockResolvedValue(undefined);
        
        const mockEvent = {
            cookies: {
                get: vi.fn().mockImplementation((name) => {
                    if (name === SESSION_COOKIE_NAME) return mockToken;
                    return undefined;
                }),
                delete: vi.fn()
            },
            locals: {}
        };

        try {
            await POST(mockEvent);
            expect.fail('Expected redirect to be thrown');
        } catch (error: any) {
            expect(error.status).toBe(303);
            expect(error.location).toBe('/auth/login');
        }
        
        expect(deleteSessionCookie).toHaveBeenCalledWith(mockEvent);
        expect(invalidateSessionByClientToken).toHaveBeenCalledWith(mockToken);
    });

    it('handles database connection failure gracefully', async () => {
        const { POST } = await import('../routes/auth/logout/+server');
        const { deleteSessionCookie } = await import('$lib/server/auth/cookies');
        const connectToDatabase = await import('$lib/server/database/database');
        
        vi.mocked(connectToDatabase.default).mockRejectedValue(new Error('Database connection failed'));
        vi.mocked(deleteSessionCookie).mockImplementation(() => {});
        
        const mockEvent = {
            cookies: {
                get: vi.fn().mockReturnValue(undefined),
                delete: vi.fn()
            },
            locals: {}
        };

        try {
            await POST(mockEvent);
            expect.fail('Expected redirect to be thrown');
        } catch (error: any) {
            expect(error.status).toBe(303);
            expect(error.location).toBe('/auth/login');
        }
        
        expect(deleteSessionCookie).toHaveBeenCalledWith(mockEvent);
    });
});