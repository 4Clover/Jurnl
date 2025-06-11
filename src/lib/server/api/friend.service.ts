import type { RequestEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { User, Entry } from '$lib/server/database/schemas';
import connectToDatabase from '$lib/server/database/database';
import type {
    FriendResponse,
    FriendUsernames,
    FriendsPublicEntries,
    SharedEntries,
} from './types/friend.types';
import {
    validateAddFriendRequest,
    validateDeleteFriendRequest,
} from './validation/friend.validation';
import { logger } from '$lib/server/logger';
import { getContext } from '$lib/server/context';

async function ensureConnection() {
    const log = logger.child({ service: 'FriendService' });
    try {
        await connectToDatabase();
    } catch (dbError) {
        log.error('Database connection failed', dbError);
        error(500, 'Database connection failed');
    }
}

async function requireAuth(event: RequestEvent) {
    if (!event.locals.user) {
        error(401, 'Unauthorized');
    }
    return event.locals.user.id;
}

async function findUserByUsername(username: string) {
    const user = await User.findOne({ username });
    if (!user) {
        error(404, 'User not found');
    }
    return user;
}

export async function addFriendFromForm(
    event: RequestEvent,
    formData: FormData,
): Promise<FriendResponse> {
    const context = getContext();
    const log = logger.child({ 
        ...context,
        service: 'FriendService',
        operation: 'addFriend'
    });
    const timer = log.startTimer();

    await ensureConnection();
    const currentUserId = await requireAuth(event);

    const friendUsername = formData.get('username') as string;
    if (!friendUsername) {
        log.warn('No username provided in friend request');
        error(400, 'No username provided');
    }

    log.debug('Adding friend', { 
        currentUserId, 
        friendUsername 
    });

    const friend = await findUserByUsername(friendUsername);

    if (currentUserId === friend._id.toString()) {
        log.warn('User attempted to add themselves as friend', { 
            userId: currentUserId 
        });
        error(400, 'Cannot add yourself as friend');
    }

    const currentUser = await User.findById(currentUserId);
    if (
        currentUser?.close_friends.some(
            (id) => id.toString() === friend._id.toString(),
        )
    ) {
        log.info('Friend relationship already exists', { 
            currentUserId, 
            friendId: friend._id.toString() 
        });
        error(400, 'Already friends');
    }

    await User.findByIdAndUpdate(currentUserId, {
        $addToSet: { close_friends: friend._id },
    });

    await User.findByIdAndUpdate(friend._id, {
        $addToSet: { can_view_friends: currentUserId },
    });

    timer.end('Friend added successfully', {
        currentUserId,
        friendId: friend._id.toString(),
        friendUsername
    });

    return { message: 'Added friend' };
}

export async function deleteFriendByUsername(
    event: RequestEvent,
    friendUsername: string,
): Promise<FriendResponse> {
    await ensureConnection();
    const currentUserId = await requireAuth(event);

    const friend = await findUserByUsername(friendUsername);

    await User.findByIdAndUpdate(currentUserId, {
        $pull: { close_friends: friend._id },
    });

    await User.findByIdAndUpdate(friend._id, {
        $pull: { can_view_friends: currentUserId },
    });

    return { message: 'successfully deleted friend' };
}

export async function getFriendUsernames(
    event: RequestEvent,
): Promise<FriendUsernames> {
    await ensureConnection();
    const currentUserId = await requireAuth(event);

    const user = await User.findById(currentUserId).select('close_friends');
    if (!user) {
        error(404, 'User not found');
    }

    const usernames: string[] = [];
    for (const friendId of user.close_friends) {
        const friend = await User.findById(friendId).select('username');
        if (friend) {
            usernames.push(friend.username);
        }
    }

    return { result: usernames };
}

export async function getFriendsPublicEntries(
    event: RequestEvent,
): Promise<FriendsPublicEntries> {
    await ensureConnection();
    const currentUserId = await requireAuth(event);

    const user = await User.findById(currentUserId).select('can_view_friends');
    if (!user) {
        error(404, 'User not found');
    }

    const result = [];
    for (const friendId of user.can_view_friends) {
        const friend = await User.findById(friendId)
            .select('bio_image_url username_display username')
            .lean();

        if (friend) {
            const publicEntries = await Entry.find({
                user: friend._id,
                shared_with_friends: 'public',
            })
                .sort({ entry_date: -1 })
                .limit(3)
                .select('title entry_date journal')
                .lean();

            result.push({
                bio_image_url: friend.bio_image_url,
                username_display: friend.username_display,
                username: friend.username,
                publicEntries: publicEntries,
            });
        }
    }

    return { result };
}

export async function getUserSharedEntries(
    event: RequestEvent,
): Promise<SharedEntries> {
    await ensureConnection();
    const currentUserId = await requireAuth(event);

    const sharedEntries = await Entry.find({
        user: currentUserId,
        shared_with_friends: 'public',
    })
        .populate('journal', 'title cover_color')
        .sort({ entry_date: -1 });

    const journalsMap = new Map();

    sharedEntries.forEach((entry) => {
        const journal = entry.journal as any;
        const journalId = journal._id.toString();

        if (!journalsMap.has(journalId)) {
            journalsMap.set(journalId, {
                id: journalId,
                color: journal.cover_color,
                title: journal.title,
                entries: [],
            });
        }

        journalsMap.get(journalId).entries.push({
            name: entry.title,
            date: entry.entry_date.toISOString().split('T')[0],
            id: entry._id.toString(),
        });
    });

    return { journalList: Array.from(journalsMap.values()) };
}

// Enhanced router-compatible functions with validation
export async function addFriendValidated(
    event: RequestEvent,
    data: unknown,
): Promise<FriendResponse> {
    const { username } = validateAddFriendRequest(data);
    const formData = new FormData();
    formData.set('username', username);
    return addFriendFromForm(event, formData);
}

export async function deleteFriendValidated(
    event: RequestEvent,
    data: unknown,
): Promise<FriendResponse> {
    const { username } = validateDeleteFriendRequest(data);
    return deleteFriendByUsername(event, username);
}
