import mongoose, { Schema, /*Types,*/ Document } from 'mongoose';

// TODO: Uncomment {userId, primary, secondary, Public, Archived} after OAuth is implemented
export interface IJournal extends Document {
    // userId: Types.ObjectId | string; // ref to User._id
    title: string;
    description?: string;
    coverImageUrl?: string;
    themeSettings: {
        paper?: string; // e.g., 'lined', 'dotted', 'custom-texture.png', '#FFFFFF'
        fontFamily?: string; //
        // primaryColor?: string; // accents within the journal
        // secondaryColor?: string;
    };
    // Konva Canvas -- Default width and height of the visible page frame for entries
    defaultEntryWidth?: number;
    defaultEntryHeight?: number;
    // isPublic: boolean; // home page public journals view?
    // isArchived: boolean;
    entryCount: number; // updates via Svelte
    lastEntryAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const JournalSchema = new Schema<IJournal>(
    {
        // userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        title: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        coverImageUrl: { type: String },
        themeSettings: {
            paper: { type: String, default: 'default-lined' },
            fontFamily: { type: String, default: 'Arial' },
            // primaryColor: { type: String },
            // secondaryColor: { type: String },
        },
        defaultEntryWidth: { type: Number, default: 500 },
        defaultEntryHeight: { type: Number, default: 500 },
        // isPublic: { type: Boolean, default: false, index: true },
        // isArchived: { type: Boolean, default: false },
        entryCount: { type: Number, default: 0 },
        lastEntryAt: { type: Date, index: true },
    },
    { timestamps: true }
);

export const Journal =
    mongoose.models.Journal ??
    mongoose.model<IJournal>('Journal', JournalSchema);
