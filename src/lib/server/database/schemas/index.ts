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
