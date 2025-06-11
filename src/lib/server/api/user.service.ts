import { type IUser, User, Entry } from '$schemas';
import { CrudService } from './base.service';
import { z } from 'zod';
import type { RequestEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import type {
    IUserWithPopulatedFriends,
    PopulatedEntry,
} from '$lib/types/populated.types';
import { USER_POPULATE_FIELDS } from '$lib/types/populated.types';

export const updateUserSchema = z.object({
    username_display: z.string().min(1).max(50).optional(),
    bio_text: z.string().max(500).optional(),
    avatar_url: z.string().url().nullable().optional(),
    bio_image_url: z.string().url().nullable().optional(),
});

export const userService = new CrudService<IUser>({
    model: User,
    validateUpdate: updateUserSchema,

    canRead: (user, event) => {
        if (!event.locals.user) return false;

        if (user._id.toString() === event.locals.user.id) return true;

        const currentUserId = event.locals.user.id;
        return (
            user.close_friends.some((id) => id.toString() === currentUserId) ||
            user.can_view_friends.some((id) => id.toString() === currentUserId)
        );
    },

    canWrite: (user, event) => {
        if (!event.locals.user) return false;
        return user._id.toString() === event.locals.user.id;
    },

    beforeUpdate: (user, data, event) => {
        const protectedFields = [
            'email',
            'google_id',
            'username',
            'auth_provider',
            'password',
        ];
        const updateData = data as Record<string, unknown>;
        protectedFields.forEach((field) => delete updateData[field]);

        if (user._id.toString() === event.locals.user!.id) {
            updateData.last_login = new Date();
        }

        return Promise.resolve(updateData);
    },
});

export async function getUserProfile(event: RequestEvent, userId: string) {
    if (!event.locals.user) {
        error(401, 'Unauthorized');
    }

    const user = await User.findById(userId)
        .populate('journals', 'title cover_color')
        .select('-password');

    if (!user) {
        error(404, 'User not found');
    }

    // Check if current user can view this profile
    const canView = await userService['options'].canRead!(user, event);
    if (!canView) {
        error(403, 'Access denied');
    }

    return user.toJSON();
}

// Friend management functions
export async function addFriend(event: RequestEvent, friendUsername: string) {
    if (!event.locals.user) {
        error(401, 'Unauthorized');
    }

    const currentUserId = event.locals.user.id;

    // Find the friend by username
    const friend = await User.findOne({ username: friendUsername });
    if (!friend) {
        error(404, 'User not found');
    }

    // Prevent adding yourself as a friend
    if (friend._id.toString() === currentUserId) {
        error(400, 'Cannot add yourself as a friend');
    }

    // Check if already friends
    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
        error(404, 'Current user not found');
    }

    if (
        currentUser.close_friends.some(
            (id) => id.toString() === friend._id.toString(),
        )
    ) {
        error(400, 'Already friends');
    }

    // Add friend to current user's close_friends
    await User.findByIdAndUpdate(currentUserId, {
        $addToSet: { close_friends: friend._id },
    });

    // Add current user to friend's can_view_friends
    await User.findByIdAndUpdate(friend._id, {
        $addToSet: { can_view_friends: currentUserId },
    });

    return { message: 'Friend added successfully' };
}

export async function deleteFriend(
    event: RequestEvent,
    friendUsername: string,
) {
    if (!event.locals.user) {
        error(401, 'Unauthorized');
    }

    const currentUserId = event.locals.user.id;

    // Find the friend by username
    const friend = await User.findOne({ username: friendUsername });
    if (!friend) {
        error(404, 'User not found');
    }

    // Remove friend from current user's close_friends
    await User.findByIdAndUpdate(currentUserId, {
        $pull: { close_friends: friend._id },
    });

    // Remove current user from friend's can_view_friends
    await User.findByIdAndUpdate(friend._id, {
        $pull: { can_view_friends: currentUserId },
    });

    return { message: 'Friend removed successfully' };
}

export async function getFriendsUsernames(event: RequestEvent) {
    if (!event.locals.user) {
        error(401, 'Unauthorized');
    }

    const currentUser = (await User.findById(event.locals.user.id)
        .populate('close_friends', USER_POPULATE_FIELDS.basic)
        .select('close_friends')) as IUserWithPopulatedFriends | null;

    if (!currentUser) {
        error(404, 'User not found');
    }

    return currentUser.close_friends.map((friend) => ({
        username: friend.username,
        username_display: friend.username_display,
        avatar_url: friend.avatar_url,
    }));
}

export async function getFriendsPublicEntries(event: RequestEvent) {
    if (!event.locals.user) {
        error(401, 'Unauthorized');
    }

    const currentUserId = event.locals.user.id;

    // Get current user's close friends
    const currentUser = (await User.findById(currentUserId)
        .populate('close_friends', USER_POPULATE_FIELDS.friend)
        .select('close_friends')) as IUserWithPopulatedFriends | null;

    if (!currentUser) {
        error(404, 'User not found');
    }

    const friendsData = [];

    for (const friend of currentUser.close_friends) {
        // Get the friend's public entries (entries shared with current user)
        const publicEntries = (await Entry.find({
            user: friend._id,
            shared_with_friends: 'public',
        })
            .populate('journal', 'title cover_color')
            .sort({ entry_date: -1 })
            .limit(3)
            .select('title entry_date journal')) as PopulatedEntry[];

        // Only include friend if they have shared entries
        if (publicEntries.length > 0) {
            friendsData.push({
                username: friend.username,
                username_display: friend.username_display,
                bio_image_url: friend.bio_image_url || friend.avatar_url,
                publicEntries: publicEntries.map((entry) => ({
                    id: entry._id,
                    title: entry.title,
                    entry_date: entry.entry_date,
                    journal: {
                        id: entry.journal._id,
                        title: entry.journal.title,
                        cover_color: entry.journal.cover_color,
                    },
                })),
            });
        }
    }

    return friendsData;
}
