<script lang="ts">
    import type { UserJournalProps } from "$lib/types/landing.types";

    let { journalTitle, journalColor, latestJournalEntries }: UserJournalProps = $props();
    const recentEntries = $derived(latestJournalEntries.slice(0, 3));
    const entryCount = $derived(latestJournalEntries.length);
</script>

<div class="user-journal">
    <div class="journal-header">
        <h3>{journalTitle}</h3>
        <span class="entry-count">{entryCount} {entryCount === 1 ? 'entry' : 'entries'}</span>
    </div>
    
    <div class="journal-preview">
        <div class="journal-cover" style="background-color:{journalColor};">
            <div class="journal-icon">📖</div>
        </div>
        
        <div class="entry-previews">
            {#if recentEntries.length > 0}
                {#each recentEntries as entry}
                    <div class="entry-preview">
                        <span class="entry-title">{entry.title}</span>
                        <span class="entry-date">
                            {new Date(entry.entry_date || entry.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                {/each}
                {#if entryCount > 3}
                    <div class="more-entries">
                        +{entryCount - 3} more
                    </div>
                {/if}
            {:else}
                <div class="no-entries">
                    <span>No entries yet</span>
                    <small>Click to add your first entry</small>
                </div>
            {/if}
        </div>
    </div>
</div>

<style lang="scss">
    .user-journal {
        background: white;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        transition: all 0.2s;
        min-width: 280px;
        cursor: pointer;
    }

    .user-journal:hover {
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .journal-header {
        padding: 1rem;
        border-bottom: 1px solid #f3f4f6;
    }

    .journal-header h3 {
        margin: 0 0 0.25rem 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: #111827;
        line-height: 1.25;
    }

    .entry-count {
        font-size: 0.75rem;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .journal-preview {
        display: flex;
        height: 160px;
    }

    .journal-cover {
        width: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, var(--color), var(--color-dark, var(--color)));
        position: relative;
        flex-shrink: 0;
    }

    .journal-icon {
        font-size: 1.5rem;
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
    }

    .entry-previews {
        flex: 1;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        justify-content: flex-start;
        overflow: hidden;
    }

    .entry-preview {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #f3f4f6;
    }

    .entry-preview:last-child {
        border-bottom: none;
        padding-bottom: 0;
    }

    .entry-title {
        font-size: 0.875rem;
        font-weight: 500;
        color: #374151;
        line-height: 1.25;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .entry-date {
        font-size: 0.75rem;
        color: #9ca3af;
    }

    .more-entries {
        font-size: 0.75rem;
        color: #6b7280;
        font-style: italic;
        text-align: center;
        padding: 0.5rem;
        background: #f9fafb;
        border-radius: 4px;
    }

    .no-entries {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        text-align: center;
        color: #9ca3af;
    }

    .no-entries span {
        font-size: 0.875rem;
        margin-bottom: 0.25rem;
    }

    .no-entries small {
        font-size: 0.75rem;
        color: #d1d5db;
    }
</style>
