<script lang="ts">
    import { page } from '$app/stores';
    import { derived } from 'svelte/store';

    import UserProfile from '$components/landing/UserProfile.svelte';
    import UserPublicEntries from '$components/landing/UserPublicEntries.svelte';
    import { onMount } from 'svelte';

    const friendInfo = derived(page, ($page) => $page.data.friendInfo);
    const friendJournals = derived(page, ($page) => $page.data.friendJournals);

    onMount(() => {
        const unsubscribeInfo = friendInfo.subscribe((value) => {
            console.log('friendInfo value:', value);
        });
        unsubscribeInfo();

        const unsubscribeJournal = friendJournals.subscribe((value) => {
            console.log('friendJournals value:', value);
        });
        unsubscribeJournal();

    });

</script>

{#if $friendInfo && $friendJournals}
    <UserProfile userInfo={$friendInfo} />
    <UserPublicEntries journalList={$friendJournals} />
{:else}
    <p>Loading...</p>
{/if}
