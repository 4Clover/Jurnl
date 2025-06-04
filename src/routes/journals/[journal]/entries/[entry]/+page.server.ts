// src/routes/journals/[journal]/entries/[entry]/+page.server.ts
import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, fetch, locals }) => {
    // Redirect to login if not authenticated
    if (!locals.user) {
        throw redirect(303, '/auth/login');
    }

    try {
        // Fetch journal and entry in parallel
        const [journalRes, entryRes] = await Promise.all([
            fetch(`/api/journals/${params.journal}`),
            fetch(`/api/journals/${params.journal}/entries/${params.entry}`)
        ]);

        // Check journal response
        if (!journalRes.ok) {
            if (journalRes.status === 404) {
                throw error(404, 'Journal not found');
            }
            throw error(journalRes.status, 'Failed to load journal');
        }

        // Check entry response
        if (!entryRes.ok) {
            if (entryRes.status === 404) {
                throw error(404, 'Entry not found');
            }
            throw error(entryRes.status, 'Failed to load entry');
        }

        const journal = await journalRes.json();
        const entry = await entryRes.json();

        // Verify entry belongs to journal
        if (entry.journal !== journal._id) {
            throw error(404, 'Entry not found in this journal');
        }

        return {
            journal,
            entry
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