import { redirect, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { invalidateSessionByClientToken } from '$lib/server/auth/sessionManager';
import { deleteSessionCookie, SESSION_COOKIE_NAME } from '$lib/server/auth/cookies';
import connectToDatabase from '$lib/server/database';

export const POST: RequestHandler = async (event) => {
    try {
        await connectToDatabase();
    } catch (dbError) {
        console.error("DB connection error during logout:", dbError);
    }

    const clientToken = event.cookies.get(SESSION_COOKIE_NAME);

    if (clientToken) {
        try {
            await invalidateSessionByClientToken(clientToken);
        } catch (error) {
            // log error but delete cookie anyway
            console.error("Error invalidating session from DB during logout:", error);
        }
    }

    deleteSessionCookie(event);

    // clear locals for the current request
    event.locals.user = null;
    event.locals.session = null;

    // check if the request prefers a JSON response
    if (event.request.headers.get('accept')?.includes('application/json')) {
        return json({ success: true, message: 'Logged out successfully' });
    } else {
        // standard form submissions
        throw redirect(303, '/auth/login');
    }
};

export const GET: RequestHandler = async () => {
    throw redirect(303, '/auth/login');
};