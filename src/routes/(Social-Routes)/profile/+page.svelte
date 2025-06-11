<script lang="ts">
    import UserProfileForm from '$lib/components/forms/UserProfileForm.svelte';
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();
</script>

<h1>EDIT USER PROFILE</h1>

<UserProfileForm userInfo={data.user} />
