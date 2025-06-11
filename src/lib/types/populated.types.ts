import type { IUser } from '$schemas';

export interface PopulatedUser {
    _id: string;
    username: string;
    username_display: string;
    avatar_url?: string;
    bio_image_url?: string;
    bio_text?: string;
    email?: string;
}

/**
 * Helper type for IUser with populated fields
 */
export type IUserWithPopulatedFriends = Omit<IUser, 'close_friends'> & {
    close_friends: PopulatedUser[];
};

export interface PopulatedJournal {
    _id: string;
    title: string;
    cover_color: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface PopulatedEntry {
    _id: string;
    title: string;
    entry_date: Date;
    journal: PopulatedJournal;
    user?: PopulatedUser;
    shared_with_friends: string;
}

/**
 * Helper type for selecting which user fields to populate
 */
export const USER_POPULATE_FIELDS = {
    basic: '_id username username_display avatar_url',
    profile: '_id username username_display avatar_url bio_image_url bio_text',
    friend: '_id username username_display bio_image_url avatar_url',
} as const;

export const JOURNAL_POPULATE_FIELDS = {
    basic: '_id title cover_color',
    full: '_id title cover_color createdAt updatedAt',
} as const;

export const ENTRY_POPULATE_FIELDS = {
    basic: '_id title entry_date',
    withJournal: '_id title entry_date journal',
} as const;
