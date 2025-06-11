// Using help from these resources: 
// 1. https://svelte.dev/docs/svelte/testing
// 2. https://vitest.dev/api/vi.html#vi-spyon
// 3. https://vitest.dev/api/vi.html#vi-mock
// 4. https://vitest.dev/api/vi.html#vi-fn

import { vi, describe, it, expect } from 'vitest';
import { POST } from '../routes/auth/logout/+server';
import * as sessionCookieModule from '$lib/server/auth/cookies';
import SESSION_COOKIE_NAME from '$lib/server/auth/cookies';
import * as sessionManager from '$lib/server/auth/sessionManager';

describe('Logout Testing', () => {
    it('deletes session cookie no client token', async() => {
        
        vi.mock('$lib/server/database/database', () => (
        {
            connectToDatabase: vi.fn().mockResolvedValue(undefined)
        }
        ));
        // Using help from: https://vitest.dev/api/vi.html#vi-spyon
        let deletedCookie = {};
        const deleteSpy = vi.spyOn(sessionCookieModule, 'deleteSessionCookie').mockImplementation(() => deletedCookie)
        deletedCookie = {};
        const event = {
            cookies: {  
                // client token is set to undefined
                get: vi.fn().mockReturnValue(undefined),
                delete: vi.fn()
            },
            locals: {}
        }
        try{
            await POST(event);
            throw new Error('Expected redirect is going to be thrown');
        }
        catch(error: any)
        {
            expect(error.status).toBe(303);
            expect(error.location).toBe('/auth/login');
        }
        expect(deleteSpy).toHaveBeenCalledWith(event)
    })
    it('deletes session despite database error no client token', async() => {
        vi.mock('$lib/server/database/database', () => (
        {
            connectToDatabase: vi.fn().mockRejectedValue(new Error('Test Connection Failure'))
        }
        ));
        
        let deletedCookie = {};
        const deleteSpy = vi.spyOn(sessionCookieModule, 'deleteSessionCookie').mockImplementation(() => deletedCookie)
        deletedCookie = {};
        const event = {
            cookies: {  
                // undefined client token
                get: vi.fn().mockReturnValue(undefined),
                delete: vi.fn()
            },
            locals: {}
        }
        try{
            await POST(event);
            throw new Error('Expected redirect is going to be thrown');
        }
        catch(error: any)
        {
            expect(error.status).toBe(303);
            expect(error.location).toBe('/auth/login');
        }
         expect(deleteSpy).toHaveBeenCalledWith(event)
    })
    it('deletes session cookie with mock client token', async() => {
        const mockToken = 'mockToken'
        const mockSessionID = 'sessionID';

        vi.spyOn(sessionManager, 'hashTokenForSessionId').mockResolvedValue(mockSessionID);
        
        vi.mock('$lib/server/database/schemas', () => {
            // mocking exec and findbyidanddelete function
            // setting exec to undefined so we don't need to check database
            const mockExec = vi.fn().mockResolvedValue(undefined);
            const findByID = vi.fn().mockReturnValue({ exec: mockExec});
            return {Session: { findByIdAndDelete: findByID }};
        });

        vi.mock('$lib/server/database/database', () => (
        {
            connectToDatabase: vi.fn().mockResolvedValue(undefined)
        }
        ));

        let deletedCookie = {};
        const deleteSpy = vi.spyOn(sessionCookieModule, 'deleteSessionCookie').mockImplementation(() => deletedCookie)
        deletedCookie = {};
        const event = {
            cookies: {  
                get: vi.fn().mockImplementation((name) => 
                {
                    if(name === SESSION_COOKIE_NAME) return mockToken;
                    return undefined;
                }),
                delete: vi.fn()
            },
            locals: {}
        }
        try{
            await POST(event);
            throw new Error('Expected redirect is going to be thrown');
        }
        catch(error: any)
        {
            expect(error.status).toBe(303);
            expect(error.location).toBe('/auth/login');
        }
         expect(deleteSpy).toHaveBeenCalledWith(event)
    })
})