// import type { RequestHandler } from '@sveltejs/kit';
// import { fail, json, redirect } from '@sveltejs/kit';
// import connectToDatabase from '$lib/server/database';
// //import mongoose, { Types } from 'mongoose';
// import { User } from '$lib/server/database/schemas';

// export const PUT: RequestHandler = async (event) => {
//     const { request, locals } = event;
//     const formData = await request.formData();
//     const rawData = Object.fromEntries(formData);
//     const friendUsername = rawData.username as string | undefined;

//     try {
//         await connectToDatabase();
//     } catch (dbError) {
//         console.error('DB connection error during adding friend', dbError);
//     }

//     // verify friend w/ username exists
//     try {
//         const friend = await User.findOne({ username: friendUsername });
//         if (friend == null) {
//             return fail(400, {
//                 data: { username: friendUsername }, // repopulating form
//                 errors: {
//                     // displaying errors
//                     form: 'username not found',
//                 },
//             });
//         }
//         // add friend to local user
//         locals.user?.close_friends.push(friend._id.toString());
//         // add modified user to db
//         try {
//             const modifiedUser = await User.findByIdAndUpdate(
//                 locals.user?._id,
//                 { $push: { closeFriends: friend._id } },
//                 { new: true },
//             );
//         } catch (error) {
//             console.log("Error modifying user's closeFriends in db", error);
//         }
//         // add modified friend to db
//         try {
//             const modifiedFriend = await User.findByIdAndUpdate(
//                 friend._id,
//                 { $push: { canViewFriends: locals.user?._id } },
//                 { new: true },
//             );
//             return json({ result: true });
//         } catch (error) {
//             console.log("Error modifying user's closeFriends in db", error);
//         }
//     } catch (error) {
//         console.log('Error finding friend in db', error);
//     }
// };
import { json, fail } from '@sveltejs/kit';
import { User } from '$lib/server/database/schemas';
import type { RequestHandler } from '@sveltejs/kit';
import connectToDatabase from '$lib/server/database';

export const POST: RequestHandler = async ({ request, locals }) => {
    const formData = await request.formData();
    const friendUsername = formData.get('username') as string;
    if (!friendUsername) {
        return fail(400, { error: 'No username provided' });
    }
    try {
        await connectToDatabase();
    } catch (dbError) {
        console.error('DB connection error during adding friend', dbError);
        return fail(500, { error: 'DB connection failed' });
    }
    // verify friend w/ username exists
    try {
        const friend = await User.findOne({ username: friendUsername });
        if (friend == null) {
            return fail(400, { error: 'friend not found' });
        }
        // // add friend to local user
        // locals.user?.close_friends.push(friend._id.toString());
        // add modified user to db
        try {
            const modifiedUser = await User.findByIdAndUpdate(
                locals.user?._id,
                { $push: { close_friends: friend._id } },
                { new: true },
            );
        } catch (error) {
            console.log("Error modifying user's closeFriends in db", error);
            return fail(500, { error: 'modify user failed' });
        }
        // add modified friend to db
        try {
            const modifiedFriend = await User.findByIdAndUpdate(
                friend._id,
                { $push: { can_view_friends: locals.user?._id } },
                { new: true },
            );
            return json({ message: 'Added friend' });
        } catch (error) {
            console.log("Error modifying user's closeFriends in db", error);
            return fail(500, { error: 'modify friend failed' });
        }
    } catch (error) {
        console.log('Error updating friend in db', error);
        return fail(500, { error: 'update failed' });
    }
};
//     try {
//         const friend = await User.findOne({ username: friendUsername });
//         locals.user?.close_friends.push(friend._id.toString());
//         await locals.user.save();

//         friend.can_view_friends.push(locals.user?._id.toString());
//         await friend.save();

//         return json({ message: 'Added friend' });
//     } catch (error) {
//         console.error('Failed updating db', error);
//         return fail(500, { error: 'Update failed' });
//     }
// };
