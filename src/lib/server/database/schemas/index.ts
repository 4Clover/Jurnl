// ---- Journal Model ----
// https://mongoosejs.com/docs/guide.html
import { Journal as JournalModel } from './journal.schema';
export const Journal = JournalModel;
export type { IJournal } from './journal.schema';

// ---- Entry Model ----
import { Entry as EntryModel } from './entry.schema';
export const Entry = EntryModel;
export type {
    IEntry,
    IEntryAttachment,
    EntryBlockKonva, // union type: use to confirm an object is for Konva
    KonvaTextConfig,
    KonvaImageConfig,
    KonvaRectConfig,
    // other Konva types here
} from './entry.schema';

// ---- User Model ----
import { User as UserModel } from './user.schema';
export const User = UserModel;
export type { IUser, SerializableUser } from './user.schema';

// ---- Session Model ----
import { Session as SessionModel } from './session.schema';
export const Session = SessionModel;
export type { ISession, SerializableSession } from './session.schema';
