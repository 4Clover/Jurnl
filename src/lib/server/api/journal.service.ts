import { Journal, type IJournal } from '$schemas';
import { CrudService } from './base.service';
import { z } from 'zod';
import { error, json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import type { FilterQuery, Types } from 'mongoose';

export const createJournalSchema = z.object({
    title: z.string().min(1).max(100),
    cover_color: z
        .string()
        .regex(/^#[0-9A-F]{6}$/i)
        .default('#4B5563'),
    description: z.string().max(500).optional(),
});

export const updateJournalSchema = z.object({
    title: z.string().min(1).max(100).optional(),
    cover_color: z
        .string()
        .regex(/^#[0-9A-F]{6}$/i)
        .optional(),
    description: z.string().max(500).optional(),
});

export const journalService = new CrudService<IJournal>({
    model: Journal,
    validateCreate: createJournalSchema,
    validateUpdate: updateJournalSchema,

    canRead: (journal, event) => {
        if (!event.locals.user) return false;
        return journal.user.toString() === event.locals.user.id;
    },

    canWrite: (journal, event) => {
        if (!event.locals.user) return false;
        return journal.user.toString() === event.locals.user.id;
    },

    beforeCreate: (data, event) => {
        if (!event.locals.user) {
            error(401, 'User not authenticated');
        }
        return Promise.resolve({
            ...(data as { title: string; cover_color: string }),
            user: event.locals.user.id,
            entries: [],
        });
    },

    afterCreate: async (journal, event) => {
        const { User } = await import('$schemas');
        await User.findByIdAndUpdate(event.locals.user!.id, {
            $push: { journals: journal._id },
        });
    },

    beforeDelete: async (journal, event) => {
        const { User } = await import('$schemas');
        await User.findByIdAndUpdate(event.locals.user!.id, {
            $pull: { journals: journal._id },
        });

        const { Entry } = await import('$schemas');
        await Entry.deleteMany({ journal: journal._id });
    },
});

// Define types for populated entries and journal data
interface PopulatedEntry {
    _id: string;
    title: string;
    entry_date: Date;
}

interface SerializedEntry {
    _id: string;
    title: string;
    entry_date: string;
}

interface SerializedJournal {
    _id: string;
    title: string;
    cover_color: string;
    description?: string;
    user: string;
    entries: SerializedEntry[];
    createdAt: Date;
    updatedAt: Date;
}

interface JournalServiceOptions {
    model: typeof Journal;
    canRead: (journal: IJournal, event: RequestEvent) => boolean;
}

// Override the list method to populate entries for landing page
export class JournalServiceWithEntries {
    private options: JournalServiceOptions;

    constructor() {
        this.options = {
            model: Journal,
            canRead: (journal: IJournal, event: RequestEvent) => {
                if (!event.locals.user) return false;
                return journal.user.toString() === event.locals.user.id;
            },
        };
    }

    async listWithRecentEntries(
        event: RequestEvent,
        filter: FilterQuery<IJournal> = {},
    ) {
        try {
            const journals = await Journal.find(filter)
                .populate({
                    path: 'entries',
                    options: {
                        sort: { entry_date: -1 }, // Most recent first
                        limit: 3, // Only get 3 most recent entries
                    },
                    select: 'title entry_date _id', // Only fields needed for preview
                })
                .lean();

            const readable: SerializedJournal[] = [];
            for (const journal of journals) {
                const journalId = (journal._id as Types.ObjectId).toString();
                const journalDoc = await Journal.findById(journalId);

                if (!journalDoc) continue;

                if (
                    !this.options.canRead ||
                    this.options.canRead(journalDoc, event)
                ) {
                    const serialized: SerializedJournal = {
                        _id: journalId,
                        title: String(journal.title),
                        cover_color: String(journal.cover_color),
                        description: journal.description
                            ? String(journal.description)
                            : undefined,
                        user: String(journal.user),
                        createdAt: journal.createdAt,
                        updatedAt: journal.updatedAt,
                        entries: Array.isArray(journal.entries)
                            ? (
                                  journal.entries as unknown as PopulatedEntry[]
                              ).map(
                                  (entry): SerializedEntry => ({
                                      _id: String(entry._id),
                                      title: String(entry.title),
                                      entry_date:
                                          entry.entry_date.toISOString(),
                                  }),
                              )
                            : [],
                    };
                    readable.push(serialized);
                }
            }

            return json(readable);
        } catch (err) {
            console.error('Error in listWithRecentEntries:', err);
            error(500, 'Failed to fetch journals with entries');
        }
    }
}

export const journalServiceWithEntries = new JournalServiceWithEntries();
