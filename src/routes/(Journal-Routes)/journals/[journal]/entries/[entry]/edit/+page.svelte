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
        flex-wrap: wrap;
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

    .subtitle {
        color: #6b7280;
        margin-top: 0.5rem;
    }

    .selector-actions {
        display: flex;
        justify-content: center;
        margin-top: 2rem;
    }

    .button {
        padding: 0.75rem 1.5rem;
        border-radius: 6px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
        font-size: 0.875rem;
    }

    .button-secondary {
        background: white;
        color: #374151;
        border: 1px solid #d1d5db;
    }

    .button-secondary:hover {
        background: #f3f4f6;
    }
</style>

<script lang="ts">
    import type { PageData } from './$types';
    import TemplateSelector from '$lib/components/entry/TemplateSelector.svelte';
    import TemplateEntryForm from '$lib/components/entry/TemplateEntryForm.svelte';
    import { detectTemplateFromEntry } from '$lib/utils/template-utils';

    let { data }: { data: PageData } = $props();

    // Detect template from existing entry data
    let selectedTemplate = $state(detectTemplateFromEntry(data.entry));
    let showTemplateSelector = $state(false);

    function handleTemplateSelect(templateId: string) {
        selectedTemplate = templateId;
        showTemplateSelector = false;
    }

    function handleTemplateChange(newTemplateId: string) {
        if (newTemplateId === '') {
            showTemplateSelector = true;
        } else {
            selectedTemplate = newTemplateId;
        }
    }
</script>

<div class="page-container">
    <header class="page-header">
        <nav class="breadcrumb">
            <a href="/journals">My Journals</a>
            <span>/</span>
            <a href="/journals/{data.journal._id}">{data.journal.title}</a>
            <span>/</span>
            <a href="/journals/{data.journal._id}/entries/{data.entry._id}"
                >{data.entry.title}</a
            >
            <span>/</span>
            <span>Edit</span>
        </nav>
        {#if showTemplateSelector}
            <h1>Change Template</h1>
            <p class="subtitle">Select a new template for your entry</p>
        {/if}
    </header>

    {#if showTemplateSelector}
        <TemplateSelector {selectedTemplate} onSelect={handleTemplateSelect} />
        <div class="selector-actions">
            <button
                type="button"
                class="button button-secondary"
                onclick={() => (showTemplateSelector = false)}
            >
                Cancel
            </button>
        </div>
    {:else}
        <TemplateEntryForm
            journalId={data.journal._id}
            entryId={data.entry._id}
            templateId={selectedTemplate}
            initialData={data.entry}
            onTemplateChange={handleTemplateChange}
        />
    {/if}
</div>
