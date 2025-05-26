import type { RequestEvent } from '@sveltejs/kit';
import { dev } from "$app/environment";

export const SESSION_COOKIE_NAME = 'le_undecided_name_session_token';

/**
 * Sets the session cookie on the client.
 */
export function setSessionCookie(
    event: RequestEvent,
    clientToken: string,
    expiresAt: Date
): void {
    const isProduction = !dev; // dev = true when using vite

    event.cookies.set(SESSION_COOKIE_NAME, clientToken, {
        path: '/',
        httpOnly: true,
        secure: isProduction, // only send over HTTPS in production
        sameSite: 'lax',
        expires: expiresAt,
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