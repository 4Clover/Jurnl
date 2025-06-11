<script lang="ts">
    import { page } from '$app/state';
    import UserProfile from '$components/landing/UserProfile.svelte';
    import UserPublicEntries from '$components/landing/UserPublicEntries.svelte';

    const { data } = $derived(page);
    const friendInfo = $derived(data.friendInfo);
    const friendJournals = $derived(data.friendJournals);
</script>

{#if friendInfo && friendJournals}
    <UserProfile userInfo={friendInfo} />
    <UserPublicEntries journalList={friendJournals} type="publicEntries" />
{:else}
    <p>Loading...</p>
{/if}
