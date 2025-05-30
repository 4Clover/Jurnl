import type { PageServerLoad } from "./$types";
import { Entry } from "$lib/server/database/schemas";
import connectToDatabase from "$lib/server/database";
import { redirect } from "@sveltejs/kit";

await connectToDatabase();

// Written with consultation of MONGODB_EXPLAINED.md in repository
// export const load : PageServerLoad = async ({params, locals}) => {
//     // Prompt to login if trying to access a journal while logged out
//     if (!locals.user) {
//         throw redirect(303, '/login');
//     }

//     try {
//         const journalEntriesFromDb = await Entry.find({
//             journalId: params.journal
//         })
//         .sort({createdAt: -1})
//         .lean();

//         const journalEntries = journalEntriesFromDb.map((entry) => ({
//             _id: entry._id.toString(),
//             entryDate: entry.entryDate,
//             title: entry.title
//         }));

//         return {
//             journalEntries,
//         };
//     } catch (err) {
//         console.error('Error fetching journal entries:', err);
//         return {entries: [], error: 'Entries could not be loaded.'}
//     }

// }