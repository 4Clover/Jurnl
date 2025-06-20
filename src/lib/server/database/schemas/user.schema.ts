import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import type { IJournal } from '.';

export interface IUser extends Document {
    _id: Types.ObjectId;

    // OAuth Fields
    email: string;
    google_id: string;

    // Display Fields
    username: string;
    username_display: string;

    // Authentication
    auth_provider: 'google';

    // Profile Fields
    avatar_url?: string;
    bio_image_url: string;
    bio_text: string;

    // Relationships
    journals: Types.ObjectId[];
    close_friends: Types.ObjectId[];
    can_view_friends: Types.ObjectId[];

    // Metadata
    last_login: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface SerializableUser {
    journals: IJournal[];
    id: string;
    email: string;
    username: string;
    username_display: string;
    avatar_url?: string;
    bio_image_url?: string;
    bio_text?: string;
    auth_provider: 'google';
    createdAt: string;
    updatedAt: string;
    close_friends: string[];
    can_view_friends: string[];
}

const UserSchema = new Schema<IUser>(
    {
        // OAuth Fields
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            validate: {
                validator: function (v: string) {
                    return /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(v);
                },
                message: 'Please provide a valid email address.',
            },
            index: true,
        },
        google_id: {
            type: String,
            sparse: true, // allows null/undefined for non-Google users
            unique: true,
            index: true,
        },

        // Display Fields
        username: {
            type: String,
            required: true,
            unique: true,
            validate: {
                validator: function (v: string) {
                    return /^[a-zA-Z0-9_]{3,20}$/.test(v);
                },
                message:
                    'Username must be 3-20 characters and contain only letters, numbers, and underscores.',
            },
        },
        username_display: {
            type: String,
            required: true,
            default: function (this: IUser) {
                return this.username;
            },
        },

        // Authentication
        auth_provider: {
            type: String,
            enum: ['google'],
            required: true,
            default: 'google',
        },

        // Profile Fields
        avatar_url: String,
        bio_image_url: String,
        bio_text: {
            type: String,
            maxlength: 500,
            default: '',
        },

        // Relationships
        journals: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Journal',
            },
        ],
        close_friends: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        can_view_friends: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],

        // Metadata
        last_login: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform: function (doc: IUser): SerializableUser {
                return {
                    id: doc._id.toString(),
                    email: doc.email,
                    username: doc.username,
                    username_display: doc.username_display,
                    avatar_url: doc.avatar_url,
                    bio_image_url: doc.bio_image_url,
                    bio_text: doc.bio_text,
                    auth_provider: doc.auth_provider,
                    createdAt: doc.createdAt.toISOString(),
                    journals: [],
                    updatedAt: doc.updatedAt.toISOString(),
                    can_view_friends: doc.can_view_friends.map((friend) =>
                        friend.toString(),
                    ),
                    close_friends: doc.close_friends.map((friend) =>
                        friend.toString(),
                    ),
                    // Don't include: google_id, journals, friends arrays
                };
            },
        },
    },
);

// Compound index on google_id and email for OAuth lookups
UserSchema.index({ google_id: 1, email: 1 });

export const User: Model<IUser> =
    (mongoose.models.User as Model<IUser>) ||
    mongoose.model<IUser>('User', UserSchema);
