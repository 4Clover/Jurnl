import type { RequestHandler } from '@sveltejs/kit';
import { fail, redirect } from '@sveltejs/kit';
import connectToDatabase from '$lib/server/database';
//import mongoose, { Types } from 'mongoose';
import { User } from '$lib/server/database/schemas';

export const PUT: RequestHandler = async (event) => {
    const { request, locals } = event;
    const formData = await request.formData();
    const rawData = Object.fromEntries(formData);
    const friendUsername = rawData.username as string | undefined;

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
        // add modified user to db
        try {
            const modifiedUser = await User.findByIdAndUpdate(
                locals.user._id,
                { $push: { closeFriends: friend._id } },
                { new: true }
            );
        } catch (error) {
            console.log("Error modifying user's closeFriends in db", error);
        }
        // add modified friend to db
        try {
            const modifiedFriend = await User.findByIdAndUpdate(
                friend._id,
                { $push: { canViewFriends: locals.user._id } },
                { new: true }
            );
            throw redirect(303, '/landing');
        } catch (error) {
            console.log("Error modifying user's closeFriends in db", error);
        }
    } catch (error) {
        console.log('Error finding friend in db', error);
    }
};
