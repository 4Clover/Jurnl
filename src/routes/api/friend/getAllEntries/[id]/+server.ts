import type { RequestHandler } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import connectToDatabase from '$lib/server/database';
import mongoose, { Types } from 'mongoose';
import { Entry } from '$lib/server/database/schemas';

export const GET: RequestHandler = async (event) => {
    const { url } = event;
    const id: string = url.searchParams('id');
    const friendId = new mongoose.Types.ObjectId(id);

    try {
        await connectToDatabase();
    } catch (dbError) {
        console.error('DB connection error during adding friend', dbError);
    }

    try {
        const entries = await Entry.find({
            userId: friendId,
            friendsCanView: true,
        })
            .sort({ journalId: 1 })
            .exec();
        return { result: entries };
    } catch (error) {
        console.error('Could not get viewable entries from friend', error);
    }
};
