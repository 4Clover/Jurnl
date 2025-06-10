import { test, expect, it, describe } from 'vitest';
import { render } from '@testing-library/svelte';
import FeedItem from '$lib/components/friends/FeedItem.svelte';

describe('FeedItem', () => {
    it('renders the feed item', () => {
        const friend = {
            username: 'Friend',
            imgurl: 'flower.png',
            entries: [
                "First Entry", "Second Entry"
            ]
        };

        const { getByText } = render(FeedItem, { friend });

        expect(getByText('Friend')).toBeInTheDocument();
        expect(getByText('First Entry')).toBeInTheDocument();
    });
});