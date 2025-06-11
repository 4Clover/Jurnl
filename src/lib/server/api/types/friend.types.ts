export interface FriendRequest {
    username: string;
}

export interface FriendResponse {
    message: string;
}

export interface FriendUsernames {
    result: string[];
}

export interface PublicEntry {
    title: string;
    entry_date: Date;
    journal: string;
}

export interface FriendWithEntries {
    bio_image_url?: string;
    username_display?: string;
    username: string;
    publicEntries: PublicEntry[];
}

export interface FriendsPublicEntries {
    result: FriendWithEntries[];
}

export interface JournalEntry {
    name: string;
    date: string;
    id: string;
}

export interface SharedJournal {
    id: string;
    color: string;
    title: string;
    entries: JournalEntry[];
}

export interface SharedEntries {
    journalList: SharedJournal[];
}
