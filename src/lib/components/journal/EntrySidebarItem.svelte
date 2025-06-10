<script lang="ts">
    import type { EntrySidebarItemProps } from '$lib/types/journal.types';
    import { goto } from '$app/navigation';

    let { title, entryId, journalId }: EntrySidebarItemProps = $props();
</script>

<button
    class="entry-sidebar-item"
    onclick={async () => {
        await goto(`/journals/${journalId}/entries/${entryId}`);
    }}
>
    <h3>{title}</h3>
</button>
