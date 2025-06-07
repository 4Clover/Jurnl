import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { invalidateSessionByClientToken } from '$lib/server/auth/sessionManager';
import {
    deleteSessionCookie,
    SESSION_COOKIE_NAME,
} from '$lib/server/auth/cookies';
import connectToDatabase from '$lib/server/database';

export const POST: RequestHandler = async (event) => {
    console.log('Logout POST endpoint hit');
    try {
        await connectToDatabase();
    } catch (dbError) {
        console.error('DB connection error during logout:', dbError);
        deleteSessionCookie(event); // delete cookie to save wonky possible states if DB not active
    }

    const clientToken = event.cookies.get(SESSION_COOKIE_NAME);

    if (clientToken) {
        try {
            await invalidateSessionByClientToken(clientToken);
            console.log('Session invalidated in DB for token:', clientToken);
        } catch (error) {
            // token could be invalid so proceed to delete cookie
            console.error(
                'Error invalidating session from DB during logout:',
                error
            );
        }
    } else {
        console.log('No session cookie found to invalidate during logout.');
    }
    // always delete the session cookie from the browser
    deleteSessionCookie(event);
    console.log('Session cookie delete instruction sent to browser.');
    // clear locals for curr request context
    event.locals.user = null;
    event.locals.session = null;

    throw redirect(303, '/auth/login');
};

export const GET: RequestHandler = async () => {
    // prevents manual routing/landing on logout page (doesnt exist currently)
    throw redirect(303, '/auth/login');
};
