import type { IJournal } from "$schemas";
import type { IEntry } from "$schemas";
import type { SerializableUser } from "$schemas";

export interface UserJournalsProps {
    journalList: IJournal[];
}

export interface UserJournalProps {
    journalTitle: string;
    journalColor: string;
    latestJournalEntries: IEntry[];
}

export interface UserProfileProps {
    userInfo: SerializableUser;
}