// noinspection DuplicatedCode
import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, fetch, locals }) => {
    // Redirect to login if not authenticated
    if (!locals.user) {
        throw redirect(303, '/auth/login');
    }

    try {
        const response = await fetch(`/api/journals/${params.journal}`);

        if (!response.ok) {
            if (response.status === 404) {
                throw error(404, 'Journal not found');
            }
            throw error(response.status, 'Failed to load journal');
        }

        const journal = await response.json();

        // Verify user owns this journal
        if (journal.user !== locals.user.id) {
            throw error(403, 'You do not have permission to add entries to this journal');
        }

        return {
            journal
        };
    } catch (err) {
        console.error('Error loading journal:', err);

        // Re-throw SvelteKit errors
        if (err && typeof err === 'object' && 'status' in err) {
            throw err;
        }

        // Generic error
        throw error(500, 'Failed to load journal');
    }
};