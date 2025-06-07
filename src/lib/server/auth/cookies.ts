import type { RequestEvent } from '@sveltejs/kit';
import { dev } from '$app/environment';

export const SESSION_COOKIE_NAME = 'Jurnl_session_token';

/**
 * Sets the session cookie on the client.
 */
export function setSessionCookie(
    event: RequestEvent,
    clientToken: string,
    expiresAt: Date
): void {
    const isProduction = !dev;
    const maxAge = Math.floor((expiresAt.getTime() - Date.now()) / 1000);

    event.cookies.set(SESSION_COOKIE_NAME, clientToken, {
        path: '/',
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax', // 'strict' if no cross-site requests used
        expires: expiresAt,
        maxAge: maxAge > 0 ? maxAge : 0, // seconds until expire
    });
}

/**
 * Deletes the session cookie from the client.
 */
export function deleteSessionCookie(event: RequestEvent): void {
    event.cookies.delete(SESSION_COOKIE_NAME, {
        path: '/',
    });
}
