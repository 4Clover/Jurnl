import { Journal, type IJournal } from '$schemas';
import { CrudService } from './base.service';
import { z } from 'zod';
import type { RequestEvent } from '@sveltejs/kit';

export const createJournalSchema = z.object({
    title: z.string().min(1).max(100),
    cover_color: z.string().regex(/^#[0-9A-F]{6}$/i).default('#4B5563')
});

export const updateJournalSchema = z.object({
    title: z.string().min(1).max(100).optional(),
    cover_color: z.string().regex(/^#[0-9A-F]{6}$/i).optional()
});

export const journalService = new CrudService<IJournal>({
    model: Journal,
    validateCreate: createJournalSchema,
    validateUpdate: updateJournalSchema,

    canRead: async (journal, event) => {
        // Check if user owns the journal
        if (!event.locals.user) return false;
        return journal.user.toString() === event.locals.user.id;
    },

    canWrite: async (journal, event) => {
        if (!event.locals.user) return false;
        return journal.user.toString() === event.locals.user.id;
    },

    beforeCreate: async (data, event) => {
        // Add the current user as owner
        if (!event.locals.user) {
            throw new Error('User not authenticated');
        }
        return {
            ...data,
            user: event.locals.user.id,
            entries: []
        };
    },

    afterCreate: async (journal, event) => {
        // Add journal to user's journals array
        const { User } = await import('$schemas');
        await User.findByIdAndUpdate(
            event.locals.user!.id,
            { $push: { journals: journal._id } }
        );
    },

    beforeDelete: async (journal, event) => {
        // Remove journal from user's journals array
        const { User } = await import('$schemas');
        await User.findByIdAndUpdate(
            event.locals.user!.id,
            { $pull: { journals: journal._id } }
        );

        // Delete all entries in this journal
        const { Entry } = await import('$schemas');
        await Entry.deleteMany({ journal: journal._id });
    }
});