import type { IEntrySerializable } from '$lib/server/database/schemas';

export interface EntrySidebarProps {
    entries: IEntrySerializable[];
}

export interface EntrySidebarItemProps {
    entryDate?: Date;
    title: string;
    entryID: string;
    journalID: string;
    createdAt?: Date;
    updatedAt?: Date;
}
