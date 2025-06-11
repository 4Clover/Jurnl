import type { IJournal, IEntrySerializable } from '$schemas';
import type { SerializableUser } from '$schemas';
import type { Types } from 'mongoose';

export interface UserJournalsProps {
    journalList: IJournal[];
}

export interface UserJournalProps {
    journalTitle: string;
    journalColor: string;
    journalId: string;
    journalDescription?: string;
    latestJournalEntries: IEntrySerializable[] | Types.ObjectId[];
}

export interface UserProfileProps {
    userInfo: SerializableUser;
}
