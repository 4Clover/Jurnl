<script lang="ts">
    import type { LayoutProps } from './$types';
    import { enhance } from '$app/forms';
    import { redirect } from '@sveltejs/kit';
    let { data, children }: LayoutProps = $props();
    import CTA_nav from "$lib/components/nav/cta_nav.svelte"
</script>

<CTA_nav />

<main>
    Welcome to Jurnl
</main>
