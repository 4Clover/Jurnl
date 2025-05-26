// Add routes to protected-route folder to check for authentication!
// SOURCE: https://blog.yuki-dev.com/blogs/x2lxp2szm

import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

const authHandle: Handle = async ({ event, resolve }) => {
    const response = await resolve(event);

    // Grabbing where 'protected-route' would be
    const rootDir = event.route.id?.split('/')[1] || '';
    const protectedDir = 'protected-route';

    /* Check if authenticated here! */
    // Auth tokens and cookies?

    // Checking if it is a protected-route and if user is authenticated
    if (rootDir === protectedDir /*&& not authenticated*/) {
        redirect(301, '/login');
    }

    return response;
};

export const handle = sequence(authHandle);
