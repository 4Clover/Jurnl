import type { RequestHandler } from '@sveltejs/kit';
import { fail, json } from '@sveltejs/kit';
import connectToDatabase from '$lib/server/database';
//import mongoose, { Types } from 'mongoose';
import { User } from '$lib/server/database/schemas';

export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        await connectToDatabase();
    } catch (dbError) {
        console.error('DB connection error during adding friend', dbError);
        return fail(500, { error: 'DB connection failed' });
    }

    // verify friend w/ username exists
    try {
        const body = await request.json();
        const { friendUsername } = body;

        const friend = await User.findOne({ username: friendUsername });
        if (friend == null) {
            return fail(400, { error: 'cannot find friend' });
        }
        // // add friend to local user
        // locals.user?.close_friends.push(friend._id.toString());
        // removing id from user in db
        try {
            const modifiedUser = await User.findByIdAndUpdate(
                locals.user._id,
                { $pull: { close_friends: friend._id } },
                { new: true, useFindAndModify: false },
            );
        } catch (error) {
            console.log("Error modifying user's closeFriends in db", error);
            return fail(500, { error: 'modify user failed' });
        }
        // removing id from friend in db
        try {
            const modifiedFriend = await User.findByIdAndUpdate(
                friend._id,
                { $pull: { can_view_friends: locals.user._id } },
                { new: true, useFindAndModify: false },
            );
            return json({ message: 'successfully deleted friend' });
        } catch (error) {
            console.log("Error modifying user's closeFriends in db", error);
            return fail(500, { error: 'modify friend failed' });
        }
    } catch (error) {
        console.log('Error finding friend in db', error);
        return fail(500, { error: 'update failed' });
    }
};
