import { json, fail } from '@sveltejs/kit';
import { User } from '$lib/server/database/schemas';
import type { RequestHandler } from '@sveltejs/kit';
import connectToDatabase from '$lib/server/database/database';

export const POST: RequestHandler = async ({ request, locals }) => {
    const formData = await request.formData();
    const friendUsername = formData.get('username') as string;
    if (!friendUsername) {
        return json({ error: 'No username provided' }, { status: 400 });
    }
    try {
        await connectToDatabase();
    } catch (dbError) {
        console.error('DB connection error during adding friend', dbError);
        return json({ error: 'DB connection failed' }, { status: 400 });
    }
    // verify friend w/ username exists
    try {
        const friend = await User.findOne({ username: friendUsername });
        if (friend == undefined) {
            return json({ error: 'friend not found' }, { status: 400 });
        }
        // add modified user to db
        try {
            const modifiedUser = await User.findByIdAndUpdate(
                locals.user?.id,
                { $push: { close_friends: friend._id } },
                { new: true },
            );
            if (modifiedUser == undefined) {
                return json({ error: 'modify user failed' }, { status: 500 });
                fail(500, { error: 'modify user failed' });
            }
        } catch (error) {
            console.log("Error modifying user's closeFriends in db", error);
            return json({ error: 'modify user failed' }, { status: 500 });
        }
        // add modified friend to db
        try {
            const modifiedFriend = await User.findByIdAndUpdate(
                friend._id,
                { $push: { can_view_friends: locals.user?.id } },
                { new: true },
            );
            if (modifiedFriend == undefined) {
                return json({ error: 'modify user failed' }, { status: 500 });
            }
            return json({ message: 'Added friend' });
        } catch (error) {
            console.log("Error modifying user's closeFriends in db", error);
            return json({ error: 'modify user failed' }, { status: 500 });
        }
    } catch (error) {
        console.log('Error updating friend in db', error);
        return json({ error: 'update failed' }, { status: 500 });
    }
};
