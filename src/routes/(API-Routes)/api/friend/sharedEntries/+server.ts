import type { RequestHandler } from '@sveltejs/kit';
import { json, fail } from '@sveltejs/kit';
import connectToDatabase from '$lib/server/database/database';
import { Entry } from '$lib/server/database/schemas';

export const GET: RequestHandler = async ({ locals }) => {
    try {
        await connectToDatabase();
    } catch (dbError) {
        console.error(
            'DB connection error during getting shared entries, dbError',
        );
        return fail(500, { error: 'db connection failed' });
    }

    const sharedEntries = await Entry.find({
        user: locals.user.id,
        shared_with_friends: 'public',
    })
        .populate('journal', 'title cover_color')
        .sort({ entry_date: -1 });

    const journalsMap = new Map();

    sharedEntries.forEach((entry) => {
        const journal = entry.journal as any;
        const journalId = journal._id.toString();
        if (!journalsMap.has(journalId)) {
            journalsMap.set(journalId, {
                id: journalId,
                color: journal.cover_color,
                title: journal.title,
                entries: [],
            });
        }
        journalsMap.get(journalId).entries.push({
            name: entry.title,
            date: entry.entry_date.toISOString().split('T')[0],
            id: entry._id.toString(),
        });
    });

    const journals = Array.from(journalsMap.values());
    return json({ journalList: journals });
};
