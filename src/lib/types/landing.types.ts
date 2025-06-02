import type { IJournal } from "$lib/server/database/schemas/journal.schema";
import type { IEntry } from "$lib/server/database/schemas";
import type { SerializableUser } from "$lib/server/database/schemas";

export interface UserJournalsProps {
    journalList: IJournal[];
}

export interface UserJournalProps {
    journalTitle: string;
    journalCoverUrl: string;
    latestJournalEntries: IEntry[];
}

export interface UserProfileProps {
    userInfo: SerializableUser;
    profileDescription?: string;
}

export interface UserFriendsProps {
}