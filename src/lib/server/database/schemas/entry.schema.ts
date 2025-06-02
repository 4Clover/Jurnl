import mongoose, { Schema, Types, Document } from 'mongoose';
import type { IJournal } from './journal.schema';

// https://konvajs.org/api/Konva.Node.html
// https://mongoosejs.com/docs/guide.html

// --- Definitions for Konva Block Configurations ---
interface KonvaNodeConfigBase {
    id: string; // unique ID for the Konva node, also key in arrays
    x: number;
    y: number;
    width?: number;
    height?: number;
    scaleX?: number;
    scaleY?: number;
    rotation?: number; // degrees
    draggable?: boolean; // Konva property
    opacity?: number;
    // IMPORTANT: array order for initial z-indexing on load -- will change later
}

export interface KonvaTextConfig extends KonvaNodeConfigBase {
    type: 'Text';
    text: string;
    fontSize?: number;
    fontFamily?: string;
    fill?: string;
    // Konva.Text specific properties
}

export interface KonvaImageConfig extends KonvaNodeConfigBase {
    type: 'Image';
    attachmentId: string; // ref to IEntryAttachment._id
    src: string; // denormalized URL for Konva.Image
    width: number;
    height: number;
    // Konva.Image specific properties
}

export interface KonvaRectConfig extends KonvaNodeConfigBase {
    type: 'Rect';
    width: number;
    height: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    //Konva.Rect specific properties
}

// OTHER SHAPE CONFIGS GO HERE: KonvaCircleConfig, KonvaLineConfig, etc.

export type EntryBlockKonva =
    | KonvaTextConfig
    | KonvaImageConfig
    | KonvaRectConfig; // <=== ADD NEW TYPES HERE

// Represents a single entry i.e, a page, within a journal
export interface IEntryAttachment extends Types.Subdocument {
    _id: Types.ObjectId;
    type: 'image' | 'audio' | 'video' | 'file';
    url: string;
    filename?: string; // user system file name upon import
    mimetype?: string;
    size?: number; // bytes
    storageKey?: string;
    caption?: string;
}

export interface IEntry extends Document {
    journalId: Types.ObjectId; // ref to Journal._id
    userId: Types.ObjectId | string; // denormalized ref to User._id
    friendsCanView: boolean;
    entryDate: Date; // set by user or default to time of creation
    title?: string;
    // CHANGE TO HTML OR STRING IF YOU WANT TO TEST BEFORE KONVA IMPLEMENTATION/READING THE DOCS
    content: EntryBlockKonva[]; // only Konva blocks exist in our pages, not raw text
    attachments: Types.DocumentArray<IEntryAttachment>; // metadata
    tags: string[];
    mood?: string; // mood reaction?
    location?: {
        name?: string;
        coordinates?: [number, number];
    };
    customFields?: Map<string, unknown>; // user fields -- possibly unneeded
    createdAt: Date;
    updatedAt: Date;
}

const EntryAttachmentSchema = new Schema<IEntryAttachment>(
    {
        type: {
            type: String,
            enum: ['image', 'audio', 'video', 'file'],
            required: true,
        },
        url: { type: String, required: true },
        filename: { type: String },
        mimetype: { type: String },
        size: { type: Number },
        storageKey: { type: String }, // supposedly important for cloud storage? unsure if cluster will handle this
        caption: { type: String },
    },
    { _id: true }
); // enables _id of subdocuments for referencing

const EntrySchema = new Schema<IEntry>(
    {
        journalId: {
            type: Schema.Types.ObjectId,
            ref: 'Journal',
            required: true,
            index: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        friendsCanView: { type: Boolean, required: true, index: true },
        entryDate: { type: Date, default: Date.now, index: true },
        title: { type: String, trim: true },
        content: { type: [Schema.Types.Mixed], default: [] }, // array of mixed objects, Svelte code will verify they are Konva blocks
        attachments: [EntryAttachmentSchema], // array of attachments
        tags: [{ type: String, trim: true, lowercase: true, index: true }],
        mood: { type: String, trim: true },
        location: {
            name: { type: String },
            coordinates: { type: [Number], index: '2dsphere' }, // for queries
        },
        customFields: { type: Map, of: Schema.Types.Mixed }, // user fields, temp mongoose any (Mixed) while building out skeleton
    },
    { timestamps: true }
);

// hook to update Journal's entryCount and lastEntryAt
EntrySchema.post<IEntry>('save', async function (doc, next) {
    if (typeof doc?.journalId === 'undefined') {
        if (next)
            next(
                new Error(
                    'Document or journalId is undefined in post-save hook'
                )
            );
        return;
    }

    const JournalModel = mongoose.model<IJournal>('Journal');
    const EntryModel = mongoose.model<IEntry>('Entry');

    try {
        const journal = await JournalModel.findById(doc.journalId);
        if (journal) {
            journal.entryCount = await EntryModel.countDocuments({
                journalId: doc.journalId,
            });
            const latestEntry = await EntryModel.findOne({
                journalId: doc.journalId,
            }).sort({ entryDate: -1, createdAt: -1 });
            if (latestEntry) {
                journal.lastEntryAt = latestEntry.entryDate;
            } else {
                journal.lastEntryAt = undefined;
            }
            await journal.save();
        }
        if (next) next();
    } catch (error) {
        if (next) next(error as Error); // pass error to next middleware
    }
});

// hook for update after deletion
EntrySchema.post<IEntry | null>(
    'findOneAndDelete',
    async function (doc: IEntry, next) {
        if (typeof doc?.journalId !== 'undefined') {
            // if doc has journalId
            const JournalModel = mongoose.model<IJournal>('Journal');
            const EntryModel = mongoose.model<IEntry>('Entry');

            try {
                const journal = await JournalModel.findById(doc.journalId);
                if (journal) {
                    journal.entryCount = await EntryModel.countDocuments({
                        journalId: doc.journalId,
                    });
                    const latestEntry = await EntryModel.findOne({
                        journalId: doc.journalId,
                    }).sort({ entryDate: -1, createdAt: -1 });
                    journal.lastEntryAt = latestEntry
                        ? latestEntry.entryDate
                        : undefined;
                    await journal.save();
                }
                if (next) next();
            } catch (error) {
                if (next) next(error as Error);
            }
        } else {
            next?.(); // fixes operation hang
        }
    }
);

export const Entry =
    mongoose.models.Entry || mongoose.model<IEntry>('Entry', EntrySchema);
