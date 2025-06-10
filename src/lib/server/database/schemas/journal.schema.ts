import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IJournal extends Document {
    title: string;
    user: Types.ObjectId; 
    cover_color: string;
    description?: string; 
    entries: Types.ObjectId[]; 
    createdAt: Date;
    updatedAt: Date;
}
// Serializable version for client-side use
export interface IJournalSerializable {
    _id: string;
    title: string;
    user: string;
    cover_color: string;
    description?: string;
    entries: string[];
    createdAt: string;
    updatedAt: string;
}

const JournalSchema = new Schema<IJournal>(
    {
        title: {
            type: String,
            required: true,
            maxlength: 100,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        cover_color: {
            type: String,
            default: '#4B5563',
            validate: {
                validator: function (v: string) {
                    return /^#[0-9A-F]{6}$/i.test(v);
                },
                message: 'Cover color must be a valid hex color.',
            },
        },
        description: {
            type: String,
            maxlength: 500,
        },
        entries: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Entry',
            },
        ],
    },
    { timestamps: true },
);

JournalSchema.set('toJSON', {
    transform: function (doc, ret) {
        // Convert ObjectIds to strings for client-side use
        ret._id = ret._id.toString();
        ret.user = ret.user.toString();
        ret.entries = ret.entries.map((entry: Types.ObjectId) => entry.toString());
        delete ret.__v;
        return ret;
    },
});

export const Journal: Model<IJournal> =
    (mongoose.models.Journal as Model<IJournal>) ||
    mongoose.model<IJournal>('Journal', JournalSchema);
