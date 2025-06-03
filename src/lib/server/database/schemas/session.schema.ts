import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface ISession extends Document {
    _id: string; // Hashed token
    userId: Types.ObjectId;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
    createdAt: Date;
}

export interface SerializableSession {
    _id: string;
    userId: string;
    expiresAt: string;
}

const SessionSchema = new Schema<ISession>(
    {
        _id: {
            type: String,
            required: [true, 'Session ID (hashed token) is required.'],
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required for the session.'],
            index: true,
        },
        expiresAt: {
            type: Date,
            required: [true, 'Session expiration date is required.'],
            index: { expires: '1s' }, // TTL index for automatic deletion
        },
        userAgent: { type: String, trim: true },
        ipAddress: { type: String, trim: true },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
        _id: false,
        toJSON: {
            transform: function (doc: ISession): SerializableSession {
                return {
                    _id: doc._id,
                    userId: doc.userId.toString(),
                    expiresAt: doc.expiresAt.toISOString(),
                };
            },
        },
    },
);

export const Session: Model<ISession> =
    (mongoose.models.Session as Model<ISession>) ||
    mongoose.model<ISession>('Session', SessionSchema);
