import type { RequestHandler } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import connectToDatabase from '$lib/server/database';
//import mongoose, { Types } from 'mongoose';
import { User } from '$lib/server/database/schemas';

export const PUT: RequestHandler = async (event) => {
    const { url, locals } = event;
    const friendUsername: string = url.searchParams('friendUsername');

    try {
        await connectToDatabase();
    } catch (dbError) {
        console.error('DB connection error during adding friend', dbError);
    }

    // verify friend w/ username exists
    try {
        const friend = await User.findOne({ username: friendUsername });
        if (friend == null) {
            return fail(400, {
                data: { username: friendUsername }, // repopulating form
                errors: {
                    // displaying errors
                    form: 'username not found',
                },
            });
        }
        // add friend to local user
        locals.user?.closeFriends.push(friend._id.toString());
        // removing id from user in db
        try {
            const modifiedUser = await User.findByIdAndUpdate(
                locals.user._id,
                { $pull: { closeFriends: friend._id } },
                { new: true, useFindAndModify: false }
            );
        } catch (error) {
            console.log("Error modifying user's closeFriends in db", error);
        }
        // removing id from friend in db
        try {
            const modifiedFriend = await User.findByIdAndUpdate(
                friend._id,
                { $pull: { canViewFriends: locals.user._id } },
                { new: true, useFindAndModify: false }
            );
            throw redirect(303, '/landing');
        } catch (error) {
            console.log("Error modifying user's closeFriends in db", error);
        }
    } catch (error) {
        console.log('Error finding friend in db', error);
    }
};
