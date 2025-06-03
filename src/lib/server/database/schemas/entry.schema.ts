import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import type { IJournal } from '$schemas';

export interface IEntry extends Document {
    journal: Types.ObjectId;
    user: Types.ObjectId;
    shared_with_friends: Types.ObjectId[];
    entry_date: Date;
    title: string;
    content_zones: {
        picture_text: {
            image: {
                url: string | null;
                alt: string;
                caption: string;
            };
            text: string;
        };
        list: {
            items: Array<{
                text: string;
                checked: boolean;
            }>;
        };
        text_right: {
            content: string;
        };
    };
    free_form_content: string;
    attachments: Array<{
        type: 'image' | 'sticker';
        id: string;
        url?: string;
        caption?: string;
        metadata: Map<string, any>;
    }>;
    createdAt: Date;
    updatedAt: Date;
}

// Serializable version for client-side use
export interface IEntrySerializable {
    _id: string;
    journal: string;
    user: string;
    shared_with_friends: string[];
    entry_date: string;
    title: string;
    content_zones: {
        picture_text: {
            image: {
                url: string | null;
                alt: string;
                caption: string;
            };
            text: string;
        };
        list: {
            items: Array<{
                text: string;
                checked: boolean;
            }>;
        };
        text_right: {
            content: string;
        };
    };
    free_form_content: string;
    attachments: Array<{
        type: 'image' | 'sticker';
        id: string;
        url?: string;
        caption?: string;
        metadata: Record<string, any>;
    }>;
    createdAt: string;
    updatedAt: string;
}

const EntrySchema = new Schema<IEntry>(
    {
        journal: {
            type: Schema.Types.ObjectId,
            ref: 'Journal',
            required: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        shared_with_friends: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        entry_date: {
            type: Date,
            default: Date.now,
        },
        title: {
            type: String,
            required: true,
            maxlength: 200,
        },
        content_zones: {
            picture_text: {
                image: {
                    url: {
                        type: String,
                        default: null,
                    },
                    alt: {
                        type: String,
                        default: '',
                    },
                    caption: {
                        type: String,
                        default: '',
                    },
                },
                text: {
                    type: String,
                    default: '',
                },
            },
            list: {
                items: [
                    {
                        text: {
                            type: String,
                            required: true,
                        },
                        checked: {
                            type: Boolean,
                            default: false,
                        },
                    },
                ],
            },
            text_right: {
                content: {
                    type: String,
                    default: '',
                },
            },
        },
        free_form_content: {
            type: String,
            default: '',
        },
        attachments: [
            {
                type: {
                    type: String,
                    enum: ['image', 'sticker'],
                    required: true,
                },
                id: {
                    type: String,
                    required: true,
                },
                url: String,
                caption: String,
                metadata: {
                    type: Map,
                    of: Schema.Types.Mixed,
                },
            },
        ],
    },
    { timestamps: true }
);

// Add toJSON method for proper serialization
EntrySchema.set('toJSON', {
    transform: function (_doc, ret, _options) {
        // Convert ObjectIds to strings for client-side use
        ret._id = ret._id.toString();
        ret.journal = ret.journal.toString();
        ret.user = ret.user.toString();
        ret.shared_with_friends = ret.shared_with_friends.map(
            (id: Types.ObjectId) => id.toString()
        );
        ret.entry_date = ret.entry_date.toISOString();
        ret.createdAt = ret.createdAt.toISOString();
        ret.updatedAt = ret.updatedAt.toISOString();

        // Convert Map to a plain object for metadata in attachments
        if (ret.attachments && Array.isArray(ret.attachments)) {
            ret.attachments = ret.attachments.map((attachment: any) => ({
                ...attachment,
                metadata: attachment.metadata
                    ? Object.fromEntries(attachment.metadata)
                    : {},
            }));
        }

        delete ret.__v;
        return ret;
    },
});

// --- Hooks ---
EntrySchema.post<IEntry>('save', async function (doc, next) {
    const JournalModel =
        (mongoose.models.Journal as Model<IJournal>) ||
        mongoose.model<IJournal>('Journal');
    if (!doc.journal) {
        console.error(
            'Entry saved without journal reference, cannot update journal.',
            doc._id
        );
        return next();
    }
    try {
        await JournalModel.findByIdAndUpdate(doc.journal, {
            $addToSet: { entries: doc._id as Types.ObjectId },
        }).exec();
        next();
    } catch (err: any) {
        console.error(
            `Error in Entry post-save hook for entry ${doc._id} (updating journal ${doc.journal}):`,
            err
        );
        next();
    }
});

EntrySchema.post<IEntry>(
    'findOneAndDelete',
    async function (doc: IEntry | null, next) {
        if (doc?.journal) {
            const JournalModel =
                (mongoose.models.Journal as Model<IJournal>) ||
                mongoose.model<IJournal>('Journal');
            try {
                await JournalModel.findByIdAndUpdate(doc.journal, {
                    $pull: { entries: doc._id as Types.ObjectId },
                }).exec();
                next();
            } catch (err: any) {
                console.error(
                    `Error in Entry post-findOneAndDelete hook for entry ${doc._id} (updating journal ${doc.journal}):`,
                    err
                );
                next();
            }
        } else {
            if (!doc) {
                // This means the findOneAndDelete operation didn't find/delete any document.
                // console.log('Entry post-findOneAndDelete hook: No document was deleted.');
            } else if (doc && !doc.journal) {
                console.warn(
                    `Entry post-findOneAndDelete hook: Deleted entry ${doc._id} had no journal reference.`
                );
            }
            next();
        }
    }
);

export const Entry: Model<IEntry> =
    (mongoose.models.Entry as Model<IEntry>) ||
    mongoose.model<IEntry>('Entry', EntrySchema);
