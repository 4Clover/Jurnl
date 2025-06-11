import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ fetch, locals }) => {
    // Redirect to login if not authenticated
    if (!locals.user) {
        throw redirect(303, '/auth/login');
    }

    try {
        const response = await fetch('/api/journals');

        if (!response.ok) {
            console.error('Failed to fetch journals:', response.status);
            return {
                journals: [],
            };
        }

        const journals = await response.json();

        return {
            journals,
        };
    } catch (error) {
        console.error('Error loading journals:', error);
        return {
            journals: [],
        };
    }
};
