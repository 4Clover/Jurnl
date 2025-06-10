import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url, fetch }) => {
    if (!locals.user) {
        // not logged in, redirect to login page
        // pass the current path as a redirectTo query parameter
        // so they can be redirected back after successful login
        redirect(
            303,
            `/auth/login?redirectTo=${encodeURIComponent(url.pathname)}`
        );
    }

    // Fetch user's journals with recent entries for landing page
    let journals = [];
    try {
        const response = await fetch('/api/journals?withEntries=true');
        if (response.ok) {
            journals = await response.json();
        } else {
            console.error('Failed to fetch journals:', response.status);
        }
    } catch (error) {
        console.error('Error loading journals:', error);
    }

    //logged in, allow access and pass user data to the page
    // use user data to get bio and stuff
    return {
        user: {
            ...locals.user,
            journals
        },
    };
};

