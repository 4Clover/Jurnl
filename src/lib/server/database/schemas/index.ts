// ---- Core Models ----
import { Journal as JournalModel } from './journal.schema';
import { Entry as EntryModel } from './entry.schema';
import { User as UserModel } from './user.schema';
import { Session as SessionModel } from './session.schema';

export const Journal = JournalModel;
export const Entry = EntryModel;
export const User = UserModel;
export const Session = SessionModel;

// ---- Type Exports ----

// User types
export type { IUser, SerializableUser } from './user.schema';

// Session types
export type { ISession, SerializableSession } from './session.schema';

// Journal types
export type { IJournal, IJournalSerializable } from './journal.schema';

// Entry types
export type { IEntry, IEntrySerializable } from './entry.schema';
