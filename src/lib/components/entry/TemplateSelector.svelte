<script lang="ts">
    import { getTemplateList, type EntryTemplate } from '$lib/types/templates.types';

    interface Props {
        selectedTemplate?: string;
        onSelect: (templateId: string) => void;
    }

    let { selectedTemplate, onSelect }: Props = $props();

    const templates = getTemplateList();

    function selectTemplate(templateId: string) {
        onSelect(templateId);
    }

    function getActiveZones(template: EntryTemplate): string[] {
        const zones = [];
        if (template.zones.picture_text.enabled) zones.push('Photos');
        if (template.zones.list.enabled) zones.push('Lists');
        if (template.zones.text_right.enabled) zones.push('Notes');
        if (template.zones.free_form_content.enabled) zones.push('Free Writing');
        return zones;
    }
</script>

<div class="template-selector">
    <h2>Choose a Template</h2>
    <p class="subtitle">Select a template to structure your journal entry</p>
    
    <div class="template-grid">
        {#each templates as template}
            <button
                class="template-card"
                class:selected={selectedTemplate === template.id}
                onclick={() => selectTemplate(template.id)}
                type="button"
            >
                <div class="template-icon">{template.icon}</div>
                <h3>{template.name}</h3>
                <p class="template-description">{template.description}</p>
                <div class="active-zones">
                    {#each getActiveZones(template) as zone}
                        <span class="zone-badge">{zone}</span>
                    {/each}
                </div>
            </button>
        {/each}
    </div>
</div>

<style>
    .template-selector {
        padding: 2rem 0;
    }

    h2 {
        text-align: center;
        font-size: 2rem;
        margin-bottom: 0.5rem;
        color: #111827;
    }

    .subtitle {
        text-align: center;
        color: #6b7280;
        margin-bottom: 2rem;
    }

    .template-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.5rem;
        max-width: 1200px;
        margin: 0 auto;
    }

    .template-card {
        background: #999f85;
        border: 2px solid #e5e7eb;
        padding: 2rem;
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: center;
        position: relative;
        overflow: hidden;
    }

    .template-card:hover {
        border-color: #4a571a;
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }

    .template-card.selected {
        border-color: #4a571a;
        background: #eff6ff;
    }

    .template-card.selected::before {
        content: '✓';
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: #4a571a;
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
    }

    .template-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
    }

    .template-card h3 {
        font-size: 1.25rem;
        margin: 0 0 0.5rem 0;
        color: #ffffff;
    }

    .template-description {
        color: #ffffff;
        font-size: 0.875rem;
        margin-bottom: 1rem;
        line-height: 1.5;
    }

    .active-zones {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        justify-content: center;
        margin-top: 1rem;
    }

    .zone-badge {
        background: #f3f4f6;
        color: #4b5563;
        padding: 0.25rem 0.75rem;
        font-size: 0.75rem;
        font-weight: 500;
    }

    .template-card.selected .zone-badge {
        background: #dbeafe;
        color: #1e40af;
    }

    @media (max-width: 768px) {
        .template-grid {
            grid-template-columns: 1fr;
        }
    }
</style>