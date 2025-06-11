import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import connectToDatabase from '$lib/server/database/database';
import { User, Entry } from '$lib/server/database/schemas';

export const GET: RequestHandler = async ({ locals }) => {
    // Check if user is authenticated
    if (!locals.user) {
        return json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
        await connectToDatabase();
    } catch (dbError) {
        console.error('DB connection error', dbError);
        return json({ error: 'db connection failed' }, { status: 500 });
    }

    try {
        // Get current user
        const currentUser = await User.findById(locals.user.id).select(
            'username username_display close_friends can_view_friends',
        );

        if (!currentUser) {
            return json({ error: 'User not found' }, { status: 404 });
        }

        // Get details about close friends
        const closeFriendsDetails = await User.find({
            _id: { $in: currentUser.close_friends || [] },
        }).select('username username_display');

        // Get details about who can view (who added current user as friend)
        const canViewFriendsDetails = await User.find({
            _id: { $in: currentUser.can_view_friends || [] },
        }).select('username username_display');

        // Get public entries from friends who added current user
        const publicEntriesFromFriends = [];
        for (const friendId of currentUser.can_view_friends || []) {
            const entries = await Entry.find({
                user: friendId,
                shared_with_friends: 'public',
            })
                .select('title entry_date shared_with_friends')
                .limit(5);

            const friend = await User.findById(friendId).select(
                'username username_display',
            );
            if (friend && entries.length > 0) {
                publicEntriesFromFriends.push({
                    friend: friend.username || friend.username_display,
                    entries: entries,
                });
            }
        }

        // Get all entries by current user to show sharing status
        const myEntries = await Entry.find({
            user: locals.user.id,
        })
            .select('title shared_with_friends entry_date')
            .limit(10);

        return json({
            currentUser: {
                username: currentUser.username,
                username_display: currentUser.username_display,
                close_friends_count: currentUser.close_friends?.length || 0,
                can_view_friends_count:
                    currentUser.can_view_friends?.length || 0,
            },
            relationships: {
                i_added_as_friends: closeFriendsDetails.map((f) => ({
                    username: f.username,
                    username_display: f.username_display,
                })),
                who_added_me_as_friend: canViewFriendsDetails.map((f) => ({
                    username: f.username,
                    username_display: f.username_display,
                })),
            },
            publicEntriesFromFriends,
            myEntries: myEntries.map((e) => ({
                title: e.title,
                shared_with_friends: e.shared_with_friends,
                entry_date: e.entry_date,
            })),
            debug_info: {
                explanation:
                    "The feed shows public entries from users in your 'can_view_friends' array - these are people who have added YOU as a friend, not people you've added.",
                total_users_who_added_me:
                    currentUser.can_view_friends?.length || 0,
                total_public_entries_available: publicEntriesFromFriends.reduce(
                    (sum, f) => sum + f.entries.length,
                    0,
                ),
            },
        });
    } catch (error) {
        console.error('Error in friends debug endpoint:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};
