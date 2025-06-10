import { test, expect, it, describe } from 'vitest';
import { render } from '@testing-library/svelte';
import UserPublicEntries from '$lib/components/landing/UserPublicEntries.svelte';
import UserProfile from '$lib/components/landing/UserProfile.svelte';
import type { userInfo } from 'os';

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

    expect(journal1).toBeInTheDocument();
    expect(journal2).toBeInTheDocument();
});

test('UserProfile', () => {
    const { getByText } = render(UserProfile, {
        userInfo: {
            username: 'Test',
            bio_text:
                "Test Text",
            bio_image_url:
                'test/img',
        },
    });

    const username = getByText('Test');
    const bio_text = getByText('Test Text');

    expect(username).toBeInTheDocument();
    expect(bio_text).toBeInTheDocument();
});
