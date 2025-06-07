import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, fetch, locals }) => {
    // Redirect to login if not authenticated
    if (!locals.user) {
        throw redirect(303, '/auth/login');
    }

    try {
        // Fetch journal and entries in parallel
        const [journalRes, entriesRes] = await Promise.all([
            fetch(`/api/journals/${params.journal}`),
            fetch(`/api/journals/${params.journal}/entries`)
        ]);

        if (!journalRes.ok) {
            if (journalRes.status === 404) {
                throw error(404, 'Journal not found');
            }
            throw error(journalRes.status, 'Failed to load journal');
        }

        const journal = await journalRes.json();
        const entries = entriesRes.ok ? await entriesRes.json() : [];

        return {
            journal,
            entries
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