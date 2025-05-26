<script lang="ts">
    import type { EntrySidebarItemProps } from '$lib/types/journal.types';

    let { entryDate, createdAt, updatedAt }: EntrySidebarItemProps = $props();
</script>

<div class="bg-babyblue">
    <h2>{entryDate}</h2>
    <p>Created {createdAt}</p>
    <p>Last updated {updatedAt}</p>
</div>
