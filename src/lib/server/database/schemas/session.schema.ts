import mongoose, { Schema, Types, Document } from 'mongoose';

export interface ISession extends Document {
    _id: string; // hashed
    userId: Types.ObjectId; // ref to User._id
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

const SessionSchema = new Schema<ISession>({
    _id: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    expiresAt: { type: Date, required: true, index: { expires: '1s' } }, // TTL index
    userAgent: { type: String },
    ipAddress: { type: String },
}, {
    timestamps: { createdAt: true, updatedAt: false },
    _id: false, // hashed
    toJSON: {
        transform: function (doc, ret) {
            ret.userId = ret.userId.toString();
            delete ret.__v;
            return ret;
        }
    }
});

export const Session = mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);