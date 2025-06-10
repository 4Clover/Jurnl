import type { RequestHandler } from '@sveltejs/kit';
import { json, fail } from '@sveltejs/kit';
import connectToDatabase from '$lib/server/database/database';
import { User } from '$lib/server/database/schemas';

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
            const usernames: string[] = [];
            for (const id of temp.close_friends) {
                try {
                    const friend = await User.findById(id).select('username');
                    if (friend) {
                        usernames.push(friend.username);
                    }
                } catch (error) {
                    console.error(
                        'Could not get viewable entries from a friend',
                        error,
                    );
                    return fail(500, { error: 'unable to find a friend' });
                }
            }
            return json({ result: usernames });
        }
        return fail(500, { error: 'unable to find friends' });
    } catch (error) {
        console.error('Could not get viewable entries from friend', error);
        return fail(500, { error: 'unable to find friends' });
    }
};
