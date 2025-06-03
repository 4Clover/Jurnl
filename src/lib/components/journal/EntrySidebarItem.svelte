<script lang="ts">
    import type { EntrySidebarItemProps } from '$lib/types/journal.types';
    import { goto } from '$app/navigation';

    let { title, entryID, journalID }: EntrySidebarItemProps = $props();
</script>

<button
    class="entry-sidebar-item"
    onclick={async () => {
        await goto(`/journals/${journalID}/${entryID}`);
    }}
>
    <h3>{title}</h3>
    <!-- <h2>{entryDate}</h2>
    <p>Created {createdAt}</p>
    <p>Last updated {updatedAt}</p> -->
</button>
