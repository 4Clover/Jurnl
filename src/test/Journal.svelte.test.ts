import { test, expect, it, describe, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import JournalMenu from '$lib/components/journal/JournalMenu.svelte';
import JournalEditDialog from '$lib/components/journal/JournalEditDialog.svelte';
import EntrySidebarItem from '$lib/components/journal/EntrySidebarItem.svelte';

describe('JournalMenu', () => {
    const props = {
        journalTitle: 'My Journal',
        journalId: '123',
    };

    it('renders the journal title', () => {
        const { getByText } = render(JournalMenu, { props });

        expect(getByText('My Journal')).toBeInTheDocument();
    });

    it('renders a "new entry" link with correct href', () => {
        const { getByText } = render(JournalMenu, { props });
        const link = getByText('new entry') as HTMLAnchorElement;
        expect(link).toBeInTheDocument();
        expect(link.tagName).toBe('A');
        expect(link.getAttribute('href')).toBe('/journals/123/entries/create');
    });
});

describe('JournalEditDialog', () => {
    const defaultProps = {
        isOpen: true,
        title: 'My Journal',
        description: 'Desc text',
        color: '#a2aec6',
        journalId: 'jid123',
    };

    it('renders form controls with initial values', () => {
        const onSave = vi.fn();
        const onCancel = vi.fn();

        const { getByDisplayValue, getAllByRole } = render(JournalEditDialog, {
            props: { ...defaultProps, onSave, onCancel },
        });

        expect(getByDisplayValue('My Journal')).toBeInTheDocument();
        expect(getByDisplayValue('Desc text')).toBeInTheDocument();
        const colorButtons = getAllByRole('button', { name: /Select #/i });
        expect(colorButtons.length).toBeGreaterThan(0);
    });
});

describe('EntrySidebarItem', () => {
    const props = {
        title: 'My Entry',
        entryId: 'e123',
        journalId: 'j123'
    };

    it('renders the journal title', () => {
        const { getByText } = render(EntrySidebarItem, { props });

        expect(getByText('My Entry')).toBeInTheDocument();
    });

});
