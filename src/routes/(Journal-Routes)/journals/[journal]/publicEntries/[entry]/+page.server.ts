import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, fetch, locals }) => {
    // Redirect to login if not authenticated
    if (!locals.user) {
        throw redirect(303, '/auth/login');
    }

    try {
        // Fetch journal and entry in parallel
        const [entryRes] = await Promise.all([
            fetch(`/api/journals/${params.journal}/entries/${params.entry}`),
        ]);

        // Check entry response
        if (!entryRes.ok) {
            if (entryRes.status === 404) {
                throw error(404, 'Entry not found');
            }
            throw error(entryRes.status, 'Failed to load entry');
        }
        const entry = await entryRes.json();
        return {
            entry,
        };
    } catch (err) {
        console.error('Error loading entry:', err);

        // Re-throw SvelteKit errors
        if (err && typeof err === 'object' && 'status' in err) {
            throw err;
        }

        // Generic error
        throw error(500, 'Failed to load entry');
    }
};
