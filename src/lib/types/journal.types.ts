import type { IEntry } from '$schemas';

export interface EntrySidebarProps {
    entries: IEntry[];
}

export interface EntrySidebarItemProps {
    entryDate?: Date;
    title: string;
    journalId: string;
    entryId: string;
}

export interface JournalCoverProps {
    journalTitle: string;
    journalId: string;
    coverColor: string;
}

export interface JournalMenuProps {
    journalTitle: string;
    journalId: string;
}
