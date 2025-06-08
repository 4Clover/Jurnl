<script lang="ts">
    import type { PageData } from './$types';
    import TemplateSelector from '$lib/components/entry/TemplateSelector.svelte';
    import TemplateEntryForm from '$lib/components/entry/TemplateEntryForm.svelte';

    let { data }: { data: PageData } = $props();

    let selectedTemplate = $state<string>('');

    function handleTemplateSelect(templateId: string) {
        selectedTemplate = templateId;
    }

    function handleTemplateChange(newTemplateId: string) {
        selectedTemplate = newTemplateId;
    }
</script>

<div class="page-container">
    <header class="page-header">
        <nav class="breadcrumb">
            <a href="/journals">My Journals</a>
            <span>/</span>
            <a href="/journals/{data.journal._id}">{data.journal.title}</a>
            <span>/</span>
            <span>New Entry</span>
        </nav>
        {#if !selectedTemplate}
            <h1>Create New Entry</h1>
        {/if}
    </header>
    
    {#if !selectedTemplate}
        <TemplateSelector
            {selectedTemplate}
            onSelect={handleTemplateSelect}
        />
    {:else}
        <TemplateEntryForm
            journalId={data.journal._id}
            templateId={selectedTemplate}
            onTemplateChange={handleTemplateChange}
        />
    {/if}
</div>

<style>
    .page-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
    }

    .page-header {
        margin-bottom: 2rem;
    }

    .breadcrumb {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        color: #6b7280;
        margin-bottom: 0.5rem;
    }

    .breadcrumb a {
        color: #3b82f6;
        text-decoration: none;
    }

    .breadcrumb a:hover {
        text-decoration: underline;
    }

    .page-header h1 {
        font-size: 2.5rem;
        margin: 0;
    }
</style>