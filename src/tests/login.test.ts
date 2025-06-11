// Using help from this resource: https://svelte.dev/docs/svelte/testing

import { vi, describe, it, expect, test } from 'vitest';
import { connectToDatabase } from '$lib/server/database/database';
import { actions } from '../routes/auth/login/+page.server';


// Redirect Path Tests
// Using this for reference on fetching redirect path: https://javascript.info/fetch-api
test('Missing Parameters Error', async() => {
    const response = await fetch('http://localhost:3000/auth/login/google/callback', {
        method: "GET", redirect: "manual"
    });
    // redirect: manual makes it so that we don't follow the redirect so we can look at 
    // it in the headers later
    expect(response.status).toBe(303);
    const path = response.headers.get("location");
    expect(path).toBe("/login?error=missing_params")
})

test('Invalid State Error', async() => {
    // Using this site for reference on the headers cookie section: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cookie
    // Make sure the cookie state and state are different to trigger the error!
    const code = "123";
    const state = "state1";
    const cookie_state = "state2";
    const response = await fetch(`http://localhost:3000/auth/login/google/callback?code=${code}&state=${state}`, {
        method: "GET", 
        headers: {
            Cookie: `oauth_state=${cookie_state}`
        },
        redirect: "manual"
    });
    expect(response.status).toBe(303);
    const path = response.headers.get("location");
    expect(path).toBe("/login?error=invalid_state");
})

// +page.server Testing
// Using this as reference for mocking: https://vitest.dev/guide/mocking.html#mocking

// Mock always successful database connection
// vi.mock('$lib/server/database/database', () => (
//     {
//         connectToDatabase: vi.fn().mockResolvedValue(undefined)
//     }
// ));

describe('actions.default tests', () => {
    it('stops user creation when connection failure', async() => {
        vi.mock('$lib/server/database/database', () => (
        {
            connectToDatabase: vi.fn().mockRejectedValue(new Error('Test Connection Failure'))
        }
        ));
        const mockForm = {
            username: 'testUser',
            password: 'test123'
        };
        const event = {
            request: {
                formData: async () => Object.entries(mockForm)
            },
            url: new URL('http://localhost:3000/login'),
            locals: {}
        };
        
        // Calling the actions handler
        const result = await actions.default(event);
        expect(result.status).toBe(500);
    });
})