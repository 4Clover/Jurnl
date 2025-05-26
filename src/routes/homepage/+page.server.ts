import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
    if (!locals.user) {
        // not logged in, redirect to login page
        // pass the current path as a redirectTo query parameter
        // so they can be redirected back after successful login
        redirect(303, `/auth/login?redirectTo=${encodeURIComponent(url.pathname)}`);
    }

    //logged in, allow access and pass user data to the page
    return {
        user: locals.user,
        dashboardData: `Welcome to your dashboard, ${locals.user.username}!`
    };
};