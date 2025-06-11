// Using help from this resource: https://svelte.dev/docs/svelte/testing
// Using help from this resource: 

import { vi, describe, it, expect, test } from 'vitest';
import { connectToDatabase } from '$lib/server/database/database';
import { invalidateSessionByClientToken } from '$lib/server/auth/sessionManager';
import { POST } from '../routes/auth/logout/+server';

// Mock always successful database connection
// vi.mock('$lib/server/database/database', () => (
//     {
//         connectToDatabase: vi.fn().mockResolvedValue(undefined)
//     }
// ));

describe('Logout Testing', () => {
    it('deletes session cookie no client token', async() => {
        vi.mock('$lib/server/database/database', () => (
        {
            connectToDatabase: vi.fn().mockResolvedValue(undefined)
        }
        ));
        
        const event = {
            cookies: {  
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
    })

})