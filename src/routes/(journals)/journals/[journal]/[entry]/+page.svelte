<script lang="ts">
    import { page } from '$app/stores';
    import EntryToolbar from '$lib/components/entry/EntryToolbar.svelte';
    import '../../../../../styles/main.scss';
</script>


<pre>
    {JSON.stringify($page, null, 2)}
</pre> 


<!-- <EntryToolbar/> -->