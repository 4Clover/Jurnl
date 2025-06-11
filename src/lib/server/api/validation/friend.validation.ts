import { z } from 'zod';

export const addFriendSchema = z.object({
    username: z
        .string()
        .min(1, 'Username is required')
        .max(50, 'Username too long'),
});

export const deleteFriendSchema = z.object({
    username: z.string().min(1, 'Username is required'),
});

export function validateAddFriendRequest(data: unknown) {
    return addFriendSchema.parse(data);
}

export function validateDeleteFriendRequest(data: unknown) {
    return deleteFriendSchema.parse(data);
}
