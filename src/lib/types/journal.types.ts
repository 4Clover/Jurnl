import type { IEntry } from '$schemas';

export interface EntrySidebarProps {
    entries: IEntry[];
}

export interface EntrySidebarItemProps {
    entryDate?: Date;
    title: string;
    createdAt?: Date;
    updatedAt?: Date;
}
