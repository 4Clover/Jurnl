<!-- Reference: https://www.w3schools.com/howto/howto_css_menu_horizontal_scroll.asp-->
<script lang="ts">
    import UserJournals from '$components/landing/UserJournals.svelte';
    import UserProfile from '$components/landing/UserProfile.svelte';
    import UserCloseFriends from '$components/landing/UserCloseFriends.svelte';
    import UserPublicEntries from '$components/landing/UserPublicEntries.svelte';

    import { page } from '$app/state';
    const { data } = $derived(page);
    const user = $derived(data.user);
    const journalList = $derived(data.friendJournals);
</script>

<main class="landing-page">
    <section class="user-journals">
        <UserJournals journalList={data.user.journals} />
    </section>
    <section class="user-profile">
        <UserProfile
            userInfo={{
                username: data.user.username_display,
                bio_image_url: data.user.bio_image_url,
                bio_text: data.user.bio_text,
            }}
        />
    </section>
    <section class="user-close-friends">
        <UserCloseFriends userInfo={data.user} />
    </section>
    <section class="user-public-entries">
        <UserPublicEntries journalList={data.journalList} type="entries" />
    </section>
</main>
