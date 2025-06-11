import { expect, it, describe } from 'vitest';
import { render } from '@testing-library/svelte';
import FeedItem from '$lib/components/friends/FeedItem.svelte';

describe('FeedItem', () => {
    it('renders the feed item', () => {
        const friend = {
            username: 'Friend',
            imgurl: 'flower.png',
            entries: [
                {
                    _id: 'entry1',
                    title: 'First Entry',
                    journal: 'journal1'
                },
                {
                    _id: 'entry2', 
                    title: 'Second Entry',
                    journal: 'journal1'
                }
            ],
        };

        const { getByText } = render(FeedItem, { friend });

        expect(getByText('Friend')).toBeTruthy();
        expect(getByText('First Entry')).toBeTruthy();
        expect(getByText('Second Entry')).toBeTruthy();
        expect(getByText('Visit')).toBeTruthy();
    });
});
