<!-- Reference: https://www.w3schools.com/howto/howto_css_menu_horizontal_scroll.asp-->
<script lang="ts">
    import UserJournals from '$lib/components/landing/UserJournals.svelte';
    import UserProfile from '$lib/components/landing/UserProfile.svelte';
    import UserCloseFriends from '$lib/components/landing/UserCloseFriends.svelte';
    import UserPublicEntries from '$lib/components/landing/UserPublicEntries.svelte';
    import type { PageProps } from './$types';
    let { data }: PageProps = $props();
    console.log(data);
</script>

<main class="landing-page">
    <section class="user-journals">
        <UserJournals />
    </section>
    <section class="user-profile">
        <UserProfile userInfo={{ username: data.user.username }} />
    </section>
    <section class="user-close-friends">
        <UserCloseFriends userInfo={data.user}/>
    </section>
    <section class="user-public-entries">
        <UserPublicEntries />
    </section>
</main>
