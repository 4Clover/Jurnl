<script lang="ts">
    import UserProfileForm from '$lib/components/forms/UserProfileForm.svelte';
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();
</script>

<h1>USER PROFILE SETUP</h1>

<UserProfileForm userInfo={data.user} />
