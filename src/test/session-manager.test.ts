import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Types } from 'mongoose';
vi.mock('$lib/server/database/schemas', () => ({
    Session: {
        findById: vi.fn(),
        findByIdAndDelete: vi.fn(),
        deleteMany: vi.fn()
    },
    User: {
        findById: vi.fn()
    }
}));

describe('Session Manager', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('generateClientSessionToken', () => {
        it('generates unique tokens', async () => {
            const { generateClientSessionToken } = await import('../lib/server/auth/sessionManager');
            
            const token1 = generateClientSessionToken();
            const token2 = generateClientSessionToken();
            
            expect(token1).toHaveLength(52);
            expect(token2).toHaveLength(52);
            expect(token1).not.toBe(token2);
        });

        it('generates cryptographically random tokens', async () => {
            const { generateClientSessionToken } = await import('../lib/server/auth/sessionManager');
            
            const tokens = new Set();
            for (let i = 0; i < 100; i++) {
                tokens.add(generateClientSessionToken());
            }
            
            expect(tokens.size).toBe(100);
        });
    });

    describe('hashTokenForSessionId', () => {
        it('produces consistent hashes for same input', async () => {
            const { hashTokenForSessionId } = await import('../lib/server/auth/sessionManager');
            
            const token = 'test-token';
            const hash1 = await hashTokenForSessionId(token);
            const hash2 = await hashTokenForSessionId(token);
            
            expect(hash1).toBe(hash2);
            expect(hash1).toHaveLength(64);
        });

        it('produces different hashes for different inputs', async () => {
            const { hashTokenForSessionId } = await import('../lib/server/auth/sessionManager');
            
            const hash1 = await hashTokenForSessionId('token1');
            const hash2 = await hashTokenForSessionId('token2');
            
            expect(hash1).not.toBe(hash2);
        });
    });

    describe('validateClientSessionToken', () => {
        it('returns null for empty token', async () => {
            const { validateClientSessionToken } = await import('../lib/server/auth/sessionManager');
            
            const result = await validateClientSessionToken('');
            
            expect(result.user).toBeNull();
            expect(result.session).toBeNull();
        });

        it('returns null for expired session', async () => {
            const { validateClientSessionToken } = await import('../lib/server/auth/sessionManager');
            const { Session } = await import('$lib/server/database/schemas');
            
            const expiredSession = {
                _id: 'session123',
                userId: new Types.ObjectId(),
                expiresAt: new Date(Date.now() - 1000)
            };
            
            vi.mocked(Session.findById).mockReturnValue({
                exec: vi.fn().mockResolvedValue(expiredSession)
            } as any);
            vi.mocked(Session.findByIdAndDelete).mockReturnValue({
                exec: vi.fn().mockResolvedValue(null)
            } as any);
            
            const result = await validateClientSessionToken('valid-token');
            
            expect(result.user).toBeNull();
            expect(result.session).toBeNull();
            expect(Session.findByIdAndDelete).toHaveBeenCalled();
        });

        it('returns user and session for valid token', async () => {
            const { validateClientSessionToken } = await import('../lib/server/auth/sessionManager');
            const { Session, User } = await import('$lib/server/database/schemas');
            
            const userId = new Types.ObjectId();
            const validSession = {
                _id: 'session123',
                userId,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
            };
            
            const mockUser = {
                _id: userId,
                username: 'testuser',
                email: 'test@example.com',
                username_display: 'Test User',
                avatar_url: '',
                bio_text: '',
                bio_image_url: '',
                auth_provider: 'google',
                createdAt: new Date(),
                updatedAt: new Date(),
                close_friends: [],
                can_view_friends: []
            };
            
            vi.mocked(Session.findById).mockReturnValue({
                exec: vi.fn().mockResolvedValue(validSession)
            } as any);
            vi.mocked(User.findById).mockReturnValue({
                exec: vi.fn().mockResolvedValue(mockUser)
            } as any);
            
            const result = await validateClientSessionToken('valid-token');
            
            expect(result.user).toBeTruthy();
            expect(result.user?.username).toBe('testuser');
            expect(result.session).toBeTruthy();
            expect(result.session?._id).toBe('session123');
        });

        it('cleans up orphaned sessions', async () => {
            const { validateClientSessionToken } = await import('../lib/server/auth/sessionManager');
            const { Session, User } = await import('$lib/server/database/schemas');
            
            const validSession = {
                _id: 'session123',
                userId: new Types.ObjectId(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
            };
            
            vi.mocked(Session.findById).mockReturnValue({
                exec: vi.fn().mockResolvedValue(validSession)
            } as any);
            vi.mocked(User.findById).mockReturnValue({
                exec: vi.fn().mockResolvedValue(null)
            } as any);
            vi.mocked(Session.findByIdAndDelete).mockReturnValue({
                exec: vi.fn().mockResolvedValue(null)
            } as any);
            
            const result = await validateClientSessionToken('valid-token');
            
            expect(result.user).toBeNull();
            expect(result.session).toBeNull();
            expect(Session.findByIdAndDelete).toHaveBeenCalled();
        });
    });

    describe('invalidateSessionByClientToken', () => {
        it('does nothing for empty token', async () => {
            const { invalidateSessionByClientToken } = await import('../lib/server/auth/sessionManager');
            const { Session } = await import('$lib/server/database/schemas');
            
            await invalidateSessionByClientToken('');
            
            expect(Session.findByIdAndDelete).not.toHaveBeenCalled();
        });

        it('deletes session for valid token', async () => {
            const { invalidateSessionByClientToken } = await import('../lib/server/auth/sessionManager');
            const { Session } = await import('$lib/server/database/schemas');
            
            vi.mocked(Session.findByIdAndDelete).mockReturnValue({
                exec: vi.fn().mockResolvedValue(null)
            } as any);
            
            await invalidateSessionByClientToken('valid-token');
            
            expect(Session.findByIdAndDelete).toHaveBeenCalled();
        });
    });

    describe('invalidateAllUserSessions', () => {
        it('deletes all sessions for user', async () => {
            const { invalidateAllUserSessions } = await import('../lib/server/auth/sessionManager');
            const { Session } = await import('$lib/server/database/schemas');
            
            const userId = new Types.ObjectId();
            vi.mocked(Session.deleteMany).mockReturnValue({
                exec: vi.fn().mockResolvedValue({ deletedCount: 3 })
            } as any);
            
            await invalidateAllUserSessions(userId);
            
            expect(Session.deleteMany).toHaveBeenCalledWith({ userId });
        });
    });

    describe('refreshSession', () => {
        it('returns null for non-existent session', async () => {
            const { refreshSession } = await import('../lib/server/auth/sessionManager');
            const { Session } = await import('$lib/server/database/schemas');
            
            vi.mocked(Session.findById).mockResolvedValue(null);
            
            const result = await refreshSession('invalid-session');
            
            expect(result).toBeNull();
        });

        it('refreshes session when close to expiry', async () => {
            const { refreshSession } = await import('../lib/server/auth/sessionManager');
            const { Session } = await import('$lib/server/database/schemas');
            
            const mockSession = {
                expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                save: vi.fn()
            };
            
            vi.mocked(Session.findById).mockResolvedValue(mockSession as any);
            
            const result = await refreshSession('session123', 7 * 24 * 60 * 60 * 1000);
            
            expect(mockSession.save).toHaveBeenCalled();
            expect(result).toBeInstanceOf(Date);
        });

        it('does not refresh session when plenty of time left', async () => {
            const { refreshSession } = await import('../lib/server/auth/sessionManager');
            const { Session } = await import('$lib/server/database/schemas');
            
            const mockSession = {
                expiresAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
                save: vi.fn()
            };
            
            vi.mocked(Session.findById).mockResolvedValue(mockSession as any);
            
            const result = await refreshSession('session123', 7 * 24 * 60 * 60 * 1000);
            
            expect(mockSession.save).not.toHaveBeenCalled();
            expect(result).toBeNull();
        });
    });
});