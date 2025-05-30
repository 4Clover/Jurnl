<script lang="ts">
    import type { EntrySidebarItemProps } from '$lib/types/journal.types';

    let { title }: EntrySidebarItemProps = $props();
</script>

<button class="entry-sidebar-item">
    <h3>{title}</h3>
    <!-- <h2>{entryDate}</h2>
    <p>Created {createdAt}</p>
    <p>Last updated {updatedAt}</p> -->
</button>
