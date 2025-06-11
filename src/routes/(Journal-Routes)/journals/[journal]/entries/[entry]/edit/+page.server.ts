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

    // Fetch the entry
    const entryResponse = await fetch(
        `/api/journals/${params.journal}/entries/${params.entry}`,
    );
    if (!entryResponse.ok) {
        throw redirect(303, `/journals/${params.journal}`);
    }
    const entry = await entryResponse.json();

    return {
        journal,
        entry,
    };
}) satisfies PageServerLoad;
