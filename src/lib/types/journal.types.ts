import type { IEntry } from '$lib/server/database/schemas';

export interface EntrySidebarProps {
    entries: IEntry[];
}

export interface EntrySidebarItemProps {
    entryDate: Date;
    title?: string;
    createdAt: Date;
    updatedAt: Date;
}
