// import { PageServerLoad } from "./$types";
// import { redirect } from "@sveltejs/kit";
// import { connectToDatabase } from "$lib/server/database";
// import type { IEntry } from "$lib/server/database/schemas";

// await connectToDatabase();

// export const load: PageServerLoad = async ({ locals }) => {
//     if (!locals.user) {
//         throw redirect(303, '/login');
//     }

//     try {
//         const entriesFromDb = await JournalEntryModel.find({
//             userId: locals.user.id,
//         })
//             .sort({ createdAt: -1 }) // Sort by newest first
//             .lean(); // .lean() returns plain JS objects, faster and uses less memory

//         // Serialize ObjectId to string and ensure data is plain for the client
//         const entries = entriesFromDb.map((entry) => ({
//             ...entry,
//             _id: entry._id.toString(),
//             userId: entry.userId.toString(), // If it's an ObjectId
//             // Ensure dates are serializable (strings or numbers)
//             createdAt: entry.createdAt.toISOString(),
//             updatedAt: entry.updatedAt.toISOString(),
//         }));

//         return {
//             entries,
//         };
//     } catch (err) {
//         console.error('Error fetching journal entries:', err);
//         return { entries: [], error: 'Could not load entries.' };
//     }
// };
