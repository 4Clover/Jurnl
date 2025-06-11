import { test, expect, it, describe } from 'vitest';
import { render } from '@testing-library/svelte';
import UserPublicEntries from '$lib/components/landing/UserPublicEntries.svelte';
import UserProfile from '$lib/components/landing/UserProfile.svelte';
import UserJournal from '$lib/components/landing/UserJournal.svelte';
import UserJournals from '$lib/components/landing/UserJournals.svelte';

test('UserPublicEntries', () => {
    const { getByText } = render(UserPublicEntries, {
        journalList: [
            {
                title: 'Test Journal 1',
                entries: [
                    { name: 'Paris Arrival', date: '2024-04-15' },
                    { name: 'Louvre Visit', date: '2024-04-16' },
                    { name: 'Train to Nice', date: '2024-04-18' },
                ],
            },
            {
                title: 'Test Journal 2',
                entries: [
                    { name: 'Monday Motivation', date: '2025-06-02' },
                    { name: 'Tuesday Blues', date: '2025-06-03' },
                ],
            },
        ],
    });

    const journal1 = getByText('Test Journal 1');
    const journal2 = getByText('Test Journal 2');

    expect(journal1).toBeTruthy();
    expect(journal2).toBeTruthy();
});

test('UserProfile', () => {
    const { getByText } = render(UserProfile, {
        userInfo: {
            username: 'Test',
            bio_text: 'Test Text',
            bio_image_url: 'test/img',
        },
    });

    const username = getByText('Test');
    const bio_text = getByText('Test Text');

    expect(username).toBeTruthy();
    expect(bio_text).toBeTruthy();
});

describe('UserJournal', () => {
    it('renders the journal title and entry count', () => {
        const props = {
            journalTitle: 'Test Journal',
            journalColor: '#ffcc00',
            journalId: 'abc123',
            journalDescription: 'A test journal.',
            latestJournalEntries: [], // no entries
        };

        const { getByText } = render(UserJournal, { props });

        expect(getByText('Test Journal')).toBeTruthy();
        expect(getByText('0 entries')).toBeTruthy();
    });

    it('renders recent entries if available', () => {
        const entryData = [
            {
                _id: 'e1',
                title: 'Entry One',
                entry_date: new Date().toISOString(),
            },
            {
                _id: 'e2',
                title: 'Entry Two',
                entry_date: new Date().toISOString(),
            },
            {
                _id: 'e3',
                title: 'Entry Three',
                entry_date: new Date().toISOString(),
            },
            {
                _id: 'e4',
                title: 'Entry Four',
                entry_date: new Date().toISOString(),
            },
        ];

        const props = {
            journalTitle: 'Populated Journal',
            journalColor: '#00ccff',
            journalId: 'xyz789',
            journalDescription: '',
            latestJournalEntries: entryData,
        };

        const { getByText } = render(UserJournal, { props });

        expect(getByText('Entry One')).toBeInTheDocument();
        expect(getByText('Entry Two')).toBeInTheDocument();
        expect(getByText('Entry Three')).toBeInTheDocument();
        expect(getByText('+1 more')).toBeInTheDocument();
    });
});

describe('UserJournals', () => {
    it('renders no journals text', () => {
        const journalList = []; // empty

        const { getByText } = render(UserJournals, { journalList });

        expect(getByText('No journals yet')).toBeInTheDocument();
    });

    it('renders journals if available', () => {
        const journalList = [
            {
                __id: 'j1',
                title: 'Journal One',
                cover_color: 'blue',
                description: 'First',
            },
            {
                __id: 'j2',
                title: 'Journal Two',
                cover_color: 'blue',
                description: 'Second',
            },
            {
                __id: 'j3',
                title: 'Journal Three',
                cover_color: 'blue',
                description: 'Third',
            },
            {
                __id: 'j4',
                title: 'Journal Four',
                cover_color: 'blue',
                description: 'Fourth',
            },
        ];

        const { getByText } = render(UserJournals, { journalList });

        expect(getByText('Journal One')).toBeInTheDocument();
        expect(getByText('Journal Two')).toBeInTheDocument();
        expect(getByText('Journal Three')).toBeInTheDocument();
        expect(getByText('Journal Four')).toBeInTheDocument();
    });
});
