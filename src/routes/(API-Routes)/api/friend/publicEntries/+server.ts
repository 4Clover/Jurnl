import type { RequestHandler } from '@sveltejs/kit';
import { json, fail } from '@sveltejs/kit';
import connectToDatabase from '$lib/server/database/database';
import { User, Entry } from '$lib/server/database/schemas';

export const GET: RequestHandler = async ({ locals }) => {
    try {
        await connectToDatabase();
    } catch (dbError) {
        console.error('DB connection error during adding friend', dbError);
        return fail(500, { error: 'db connection failed' });
    }

    try {
        const temp = await User.findById(locals.user.id);
        if (temp) {
            const result = [];
            for (const id of temp.can_view_friends) {
                try {
                    // get friend's info
                    const friend = await User.findById(id)
                        .select('bio_image_url username_display username')
                        .lean();
                    if (friend) {
                        try {
                            const publicEntries = await Entry.find({
                                user: friend._id,
                                shared_with_friends: 'public',
                            })
                                .sort({ entry_date: -1 })
                                .limit(3)
                                .select('title entry_date journal')
                                .lean();
                            const friendResponse = {
                                bio_image_url: friend.bio_image_url,
                                username_display: friend.username_display,
                                username: friend.username,
                                publicEntries: publicEntries,
                            };
                            result.push(friendResponse);
                        } catch (dberror) {
                            console.error(
                                'could not get public entries',
                                dberror,
                            );
                            return fail(500, {
                                error: 'could not get public entries',
                            });
                        }
                    } else {
                        return fail(500, { error: 'unable to find a friend' });
                    }
                } catch (error) {
                    console.error(
                        'Could not get viewable entries from a friend',
                        error,
                    );
                    return fail(500, { error: 'unable to find a friend' });
                }
            }
            return json({ result: result });
        }
        return fail(500, { error: 'unable to find friends' });
    } catch (error) {
        console.log('here');
        console.error('Could not get viewable entries from friend', error);
        return fail(500, { error: 'unable to find friends' });
    }
};
