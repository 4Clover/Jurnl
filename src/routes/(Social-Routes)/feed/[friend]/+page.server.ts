import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { User, Entry } from '$lib/server/database/schemas';

export const load: PageServerLoad = async ({ params, locals }) => {
    if (!locals.user) {
        error(401, 'Unauthorized');
    }

    const { friend: friendUsername } = params;

    try {
        // Find the friend by username
        const friend = await User.findOne({ username: friendUsername }).select(
            'username username_display bio_text bio_image_url avatar_url',
        );

        if (!friend) {
            error(404, 'User not found');
        }

        // Check if current user can view this friend
        const currentUser = await User.findById(locals.user.id).select(
            'close_friends',
        );
        const isFriend = currentUser?.close_friends.some(
            (id) => id.toString() === friend._id.toString(),
        );

        if (!isFriend) {
            error(403, 'You can only view profiles of your friends');
        }

        // Get friend's shared entries grouped by journal
        const sharedEntries = await Entry.find({
            user: friend._id,
            shared_with_friends: 'public',
        })
            .populate('journal', 'title cover_color')
            .sort({ entry_date: -1 });

        // Group entries by journal
        const journalsMap = new Map();

        sharedEntries.forEach((entry) => {
            const journal = entry.journal as any; // Type assertion for populated field
            const journalId = journal._id.toString();
            if (!journalsMap.has(journalId)) {
                journalsMap.set(journalId, {
                    title: journal.title,
                    entries: [],
                });
            }
            journalsMap.get(journalId).entries.push({
                name: entry.title,
                date: entry.entry_date.toISOString().split('T')[0],
            });
        });

        const journals = Array.from(journalsMap.values());

        const friendInfo = {
            username: friend.username,
            username_display: friend.username_display,
            bio_text: friend.bio_text || "This user hasn't written a bio yet.",
            bio_image_url:
                friend.bio_image_url ||
                friend.avatar_url ||
                'https://i.pinimg.com/736x/6c/21/68/6c21684b57384c2d91d6d86ef2cbe2a4.jpg',
        };

        return {
            friendInfo,
            friendJournals: journals,
        };
    } catch (err) {
        console.error('Error loading friend profile:', err);
        error(500, 'Failed to load friend profile');
    }
};
