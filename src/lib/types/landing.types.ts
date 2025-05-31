import type { IJournal } from "$lib/server/database/schemas/journal.schema";
import type { IEntry } from "$lib/server/database/schemas";

export interface UserJournalsProps {
    journallist: IJournal[];
}

export interface UserJournalProps {
    journalTitle: string;
    journalCoverUrl: string;
    latestJournalEntries: IEntry[];
}