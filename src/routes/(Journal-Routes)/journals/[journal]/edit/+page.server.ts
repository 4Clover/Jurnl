import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ params, parent, fetch }) => {
    const { user } = await parent();
    
    if (!user) {
        throw redirect(303, '/auth/login');
    }

    // Fetch the journal to ensure user has access
    const journalResponse = await fetch(`/api/journals/${params.journal}`);
    if (!journalResponse.ok) {
        throw redirect(303, '/journals');
    }
    const journal = await journalResponse.json();

    return {
        journal
    };
}) satisfies PageServerLoad;