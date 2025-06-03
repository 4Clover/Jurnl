import { type IUser, User } from '$schemas';
import { CrudService } from './base.service';
import { z } from 'zod';
import type { RequestEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

export const updateUserSchema = z.object({
    username_display: z.string().min(1).max(50).optional(),
    bio_text: z.string().max(500).optional(),
    avatar_url: z.string().url().nullable().optional(),
    bio_image_url: z.string().url().nullable().optional(),
});

export const userService = new CrudService<IUser>({
    model: User,
    validateUpdate: updateUserSchema,

    canRead: async (user, event) => {
        if (!event.locals.user) return false;

        // Users can read their own profile
        if (user._id.toString() === event.locals.user.id) return true;

        // Check if users are friends (if you implement friend system)
        const currentUserId = event.locals.user.id;
        return (
            user.close_friends.some((id) => id.toString() === currentUserId) ||
            user.can_view_friends.some((id) => id.toString() === currentUserId)
        );
    },

    canWrite: async (user, event) => {
        if (!event.locals.user) return false;
        // Users can only update their own profile
        return user._id.toString() === event.locals.user.id;
    },

    beforeUpdate: async (user, data, event) => {
        // Prevent updating protected fields
        const protectedFields = [
            'email',
            'google_id',
            'username',
            'auth_provider',
            'password',
        ];
        protectedFields.forEach((field) => delete data[field]);

        // Update last_login if it's the user's own profile
        if (user._id.toString() === event.locals.user!.id) {
            data.last_login = new Date();
        }

        return data;
    },
});

// Additional user-specific methods
export async function getUserProfile(event: RequestEvent, userId: string) {
    if (!event.locals.user) {
        throw error(401, 'Unauthorized');
    }

    const user = await User.findById(userId)
        .populate('journals', 'title cover_color')
        .select('-password');

    if (!user) {
        throw error(404, 'User not found');
    }

    // Check if current user can view this profile
    const canView = await userService['options'].canRead!(user, event);
    if (!canView) {
        throw error(403, 'Access denied');
    }

    return user.toJSON();
}