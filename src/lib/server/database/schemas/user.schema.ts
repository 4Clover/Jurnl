import mongoose, { Schema, Types, Document } from 'mongoose';

export interface IUser extends Document {
    _id: Types.ObjectId;
    username: string;
    email?: string;
    hashedPassword?: string;
    avatarUrl?: string;
    createdAt: Date;
    updatedAt: Date;
    closeFriends: Array<Types.ObjectId>;
    canViewFriends: Array<Types.ObjectId>;
}
export interface SerializableUser {
    _id: string;
    username: string;
    email?: string;
    avatarUrl?: string;
    createdAt: string;
    updatedAt: string;
    closeFriends: Array<string>;
    canViewFriends: Array<string>;
}

const UserSchema = new Schema<IUser>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3,
            index: true,
        },
        email: {
            type: String,
            unique: true,
            trim: true,
            sparse: true,
            match: [/.+@.+\..+/, 'Please provide a valid email address'],
            index: true,
        },
        hashedPassword: {
            type: String,
            required: true,
            select: false, // IMPORTANT: excludes from default queries and .toJSON()
        },
        avatarUrl: {
            type: String,
        },
        myCloseFriends: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
                default: [],
            },
        ],
        viewAccessFriends: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
                default: [],
            },
        ],
    },
    {
        timestamps: true, // adds createdAt, updatedAt (as Date objects)
        toJSON: {
            // mongoose toJSON transform options
            transform: function (doc, ret) {
                ret._id = ret._id.toString(); // ensure _id is string
                delete ret.hashedPassword; // explicitly delete again
                delete ret.__v; // remove version key
                if (ret.createdAt instanceof Date) {
                    ret.createdAt = ret.createdAt.toISOString();
                }
                if (ret.updatedAt instanceof Date) {
                    ret.updatedAt = ret.updatedAt.toISOString();
                }
                return ret;
            },
        },
    }
);

export const User =
    mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
