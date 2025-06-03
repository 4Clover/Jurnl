// Schema by Dillon - copying and pasting what he forgot to commit

import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IUser extends Document {
    _id: Types.ObjectId;

    // OAuth Fields
    email: string;
    google_id?: string;

    // Display Fields
    username: string;
    username_display: string;

    // Authentication
    password: string; // Optional for OAuth users
    auth_provider: 'password';

    // Profile Fields
    avatar_url?: string;
    bio_image_url?: string;
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
    id: string;
    email: string;
    username: string;
    username_display: string;
    avatar_url?: string;
    bio_image_url?: string;
    bio_text: string;
    auth_provider: 'google' | 'password';
    journals?: string[];
    close_friends?: string[];
    can_view_friends?: string[];
    createdAt: string;
}

const UserSchema = new Schema<IUser>(
    {
        // OAuth Fields
        email: {
            type: String,
            required: false,
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
            required: false,
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
            required: false,
            default: function (this: IUser) {
                return this.username;
            },
        },

        // Authentication
        password: {
            type: String,
            required: true,
            select: false,
        },
        auth_provider: {
            type: String,
            enum: ['google', 'password'],
            default: 'google',
        },

        // Profile Fields
        avatar_url: {
            type: String,
            default: null,
        },
        bio_image_url: {
            type: String,
            default: null,
        },
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
                    journals: doc.journals?.map((id) => id.toString()),
                    close_friends: doc.close_friends?.map((id) =>
                        id.toString(),
                    ),
                    can_view_friends: doc.can_view_friends?.map((id) =>
                        id.toString(),
                    ),
                    createdAt: doc.createdAt.toISOString(),
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