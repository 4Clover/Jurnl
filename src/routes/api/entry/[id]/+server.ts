// import type { JournalEntryData } from "$lib/types";
import type { RequestHandler } from '@sveltejs/kit';

// Retrieve a journal entry by ID
export const GET: RequestHandler = ({ url }) => {
    const entryId = Number(url.searchParams.get('entryId'));

    // placeholder HTTP response code
    return new Response(String(entryId));
};

export function POST() {}

// Edit some attribute of the journal entry
export function PUT() {}

export function DELETE() {}
