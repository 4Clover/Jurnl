import type { RequestHandler } from '@sveltejs/kit';
//import { redirect } from '@sveltejs/kit';
import connectToDatabase from '$lib/server/database';
//import mongoose, { Types } from 'mongoose';
import { User } from '$lib/server/database/schemas';

export const GET: RequestHandler = async (event) => {
    const { locals } = event;

    try {
        await connectToDatabase();
    } catch (dbError) {
        console.error('DB connection error during adding friend', dbError);
    }

    try {
        const usernames = await User.find(
            { _id: { $in: locals.user?.closeFriends } },
            { username: 1 }
        );
        return { result: usernames };
    } catch (error) {
        console.error('Could not get viewable entries from friend', error);
    }
};
