import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { fail } from '@sveltejs/kit';
import { actions } from '../routes/auth/login/+page.server';

// Mock the database connection
vi.mock('$lib/server/database/database', () => ({
    default: vi.fn()
}));

// Mock the User model
vi.mock('$lib/server/database/schemas', () => ({
    User: {
        findOne: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
                exec: vi.fn()
            })
        })
    }
}));

// Mock password verification
vi.mock('$lib/server/auth/password', () => ({
    verifyPassword: vi.fn()
}));

// Mock session management
vi.mock('$lib/server/auth/sessionManager', () => ({
    createSession: vi.fn()
}));

// Mock cookies
vi.mock('$lib/server/auth/cookies', () => ({
    setSessionCookie: vi.fn()
}));

describe('Login Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns validation error for missing username', async () => {
        const mockEvent = {
            request: {
                formData: async () => new FormData()
            },
            url: new URL('http://localhost:3000/login'),
            locals: {}
        };

        const result = await actions.default(mockEvent);
        
        expect(result.status).toBe(400);
        expect(result.data).toHaveProperty('errors');
    });

    it('returns validation error for missing password', async () => {
        const formData = new FormData();
        formData.append('username', 'testuser');
        
        const mockEvent = {
            request: {
                formData: async () => formData
            },
            url: new URL('http://localhost:3000/login'),
            locals: {}
        };

        const result = await actions.default(mockEvent);
        
        expect(result.status).toBe(400);
        expect(result.data).toHaveProperty('errors');
    });

    it('handles database connection failure', async () => {
        const connectToDatabase = await import('$lib/server/database/database');
        vi.mocked(connectToDatabase.default).mockRejectedValue(new Error('Database connection failed'));
        
        const formData = new FormData();
        formData.append('username', 'testuser');
        formData.append('password', 'testpass');
        
        const mockEvent = {
            request: {
                formData: async () => formData
            },
            url: new URL('http://localhost:3000/login'),
            locals: {}
        };

        const result = await actions.default(mockEvent);
        
        expect(result.status).toBe(500);
        expect(result.data?.errors?.form).toContain('unexpected server error');
    });

    it('returns error for invalid credentials', async () => {
        const connectToDatabase = await import('$lib/server/database/database');
        const { User } = await import('$lib/server/database/schemas');
        
        vi.mocked(connectToDatabase.default).mockResolvedValue(undefined);
        vi.mocked(User.findOne).mockReturnValue({
            select: vi.fn().mockReturnValue({
                exec: vi.fn().mockResolvedValue(null)
            })
        } as any);
        
        const formData = new FormData();
        formData.append('username', 'invaliduser');
        formData.append('password', 'wrongpass');
        
        const mockEvent = {
            request: {
                formData: async () => formData
            },
            url: new URL('http://localhost:3000/login'),
            locals: {}
        };

        const result = await actions.default(mockEvent);
        
        expect(result.status).toBe(400);
        expect(result.data).toHaveProperty('errors');
    });
});