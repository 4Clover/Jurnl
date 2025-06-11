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
