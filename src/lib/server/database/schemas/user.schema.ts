import mongoose, { Schema, Types, Document } from 'mongoose';

export interface IUser extends Document {
    _id: Types.ObjectId;
    username: string;
    email?: string;
    hashedPassword?: string;
    avatarUrl?: string;
    createdAt: Date;
    updatedAt: Date;
    close_friends: Types.ObjectId[];
    can_view_friends: Types.ObjectId[];
}
export interface SerializableUser {
    _id: string;
    username: string;
    email?: string;
    avatarUrl?: string;
    createdAt: string;
    updatedAt: string;
    close_friends: string[];
    can_view_friends: string[];
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
    },
    {
        timestamps: true, // adds createdAt, updatedAt (as Date objects)
        toJSON: {
            // mongoose toJSON transform options
            transform: function (_doc, ret) {
                ret._id = ret._id.toString(); // ensure _id is string
                delete ret.hashedPassword; // explicitly delete again
                delete ret.__v; // remove version key
                if (ret.createdAt instanceof Date) {
                    ret.createdAt = ret.createdAt.toISOString();
                }
                if (ret.updatedAt instanceof Date) {
                    ret.updatedAt = ret.updatedAt.toISOString();
                }
                ret.close_friends = _doc.close_friends.map((id) =>
                    id.toString(),
                );
                ret.can_view_friends = _doc.can_view_friends.map((id) =>
                    id.toString(),
                );
                return ret;
            },
        },
    },
);

export const User =
    mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
