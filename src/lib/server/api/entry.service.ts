import { Entry, Journal, type IEntry } from '$schemas';
import { CrudService } from './base.service';
import { z } from 'zod';
import type { RequestEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

export const contentZonesSchema = z.object({
    picture_text: z.object({
        image: z.object({
            url: z.string().nullable(),
            alt: z.string().default(''),
            caption: z.string().default(''),
        }),
        text: z.string().default(''),
    }),
    list: z.object({
        items: z
            .array(
                z.object({
                    text: z.string(),
                    checked: z.boolean().default(false),
                }),
            )
            .default([]),
    }),
    text_right: z.object({
        content: z.string().default(''),
    }),
});

export const createEntrySchema = z.object({
    title: z.string().min(1).max(200),
    entry_date: z.string().datetime().optional(),
    content_zones: contentZonesSchema,
    free_form_content: z.string().default(''),
    shared_with_friends: z.string().default('private'),
    attachments: z
        .array(
            z.object({
                type: z.enum(['image', 'sticker']),
                id: z.string(),
                url: z.string().optional(),
                caption: z.string().optional(),
                metadata: z.record(z.any()).optional(),
            }),
        )
        .optional()
        .default([]),
});

export const updateEntrySchema = createEntrySchema.partial();

export class EntryService extends CrudService<IEntry> {
    constructor() {
        super({
            model: Entry,
            validateCreate: createEntrySchema,
            validateUpdate: updateEntrySchema,

            canRead: (entry, event) => {
                if (!event.locals.user) return false;
                const userId = event.locals.user.id;

                // Check if user owns the entry or is in shared_with_friends
                return (
                    entry.user.toString() === userId ||
                    entry.shared_with_friends === 'public'
                );
            },

            canWrite: (entry, event) => {
                if (!event.locals.user) return false;
                return entry.user.toString() === event.locals.user.id;
            },

            beforeCreate: async (data, event) => {
                if (!event.locals.user) {
                    error(401, 'Not authenticated');
                }

                // Ensure we have a journal ID
                const journalId =
                    event.params?.journal ||
                    (data as { journal: string }).journal;
                if (!journalId) {
                    error(400, 'Journal ID is required');
                }

                // Verify journal exists and user owns it
                const journal = await Journal.findById(journalId);
                if (!journal) {
                    error(404, 'Journal not found');
                }

                if (journal.user.toString() !== event.locals.user.id) {
                    error(403, 'You do not own this journal');
                }

                return {
                    ...(data as { journal: string }),
                    journal: journalId,
                    user: event.locals.user.id,
                    entry_date:
                        (data as { entry_date: string }).entry_date ||
                        new Date().toISOString(),
                };
            },
        });
    }

    // Additional method to get entries for a specific journal
    async listByJournal(event: RequestEvent, journalId: string) {
        if (!event.locals.user) {
            error(401, 'Not authenticated');
        }

        // Verify user owns the journal
        const journal = await Journal.findById(journalId);
        if (!journal) {
            error(404, 'Journal not found');
        }

        if (journal.user.toString() !== event.locals.user.id) {
            error(403, 'Access denied');
        }

        return this.list(event, {
            journal: journalId,
            user: event.locals.user.id,
        });
    }
}

export const entryService = new EntryService();
