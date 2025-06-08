export interface TemplateZoneConfig {
    enabled: boolean;
    required?: boolean;
    label?: string;
    description?: string;
}

export interface EntryTemplate { 
    id: string;
    name: string;
    description: string;
    icon?: string;
    zones: {
        picture_text: TemplateZoneConfig;
        list: TemplateZoneConfig;
        text_right: TemplateZoneConfig;
        free_form_content: TemplateZoneConfig;
    };
}

export const ENTRY_TEMPLATES: Record<string, EntryTemplate> = {
    daily: {
        id: 'daily',
        name: 'Daily Entry',
        description: 'Simple daily journal entry focused on free writing',
        icon: '📝',
        zones: {
            picture_text: { enabled: false },
            list: { enabled: false },
            text_right: { enabled: false },
            free_form_content: { 
                enabled: true, 
                required: true,
                label: 'Your Daily Thoughts',
                description: 'Write freely about your day'
            }
        }
    },
    photo: {
        id: 'photo',
        name: 'Photo Journal',
        description: 'Capture memories with photos and descriptions',
        icon: '📷',
        zones: {
            picture_text: { 
                enabled: true, 
                required: true,
                label: 'Photo & Story',
                description: 'Add a photo and tell its story'
            },
            list: { enabled: false },
            text_right: { enabled: false },
            free_form_content: { 
                enabled: true,
                label: 'Additional Notes',
                description: 'Any other thoughts about this memory'
            }
        }
    },
    tasks: {
        id: 'tasks',
        name: 'Task List',
        description: 'Track your goals, tasks, and progress',
        icon: '✅',
        zones: {
            picture_text: { enabled: false },
            list: { 
                enabled: true, 
                required: true,
                label: 'Tasks & Goals',
                description: 'List your tasks and check them off'
            },
            text_right: { 
                enabled: true,
                label: 'Notes & Reflections',
                description: 'Notes about your progress'
            },
            free_form_content: { enabled: false }
        }
    },
    reflection: {
        id: 'reflection',
        name: 'Reflection',
        description: 'Comprehensive entry with all sections available',
        icon: '🤔',
        zones: {
            picture_text: { 
                enabled: true,
                label: 'Visual Memory',
                description: 'Add a photo that represents your day'
            },
            list: { 
                enabled: true,
                label: 'Key Points',
                description: 'List important moments or thoughts'
            },
            text_right: { 
                enabled: true,
                label: 'Insights',
                description: 'What did you learn today?'
            },
            free_form_content: { 
                enabled: true,
                label: 'Deep Reflection',
                description: 'Explore your thoughts in detail'
            }
        }
    },
    custom: {
        id: 'custom',
        name: 'Custom',
        description: 'All sections available - use what you need',
        icon: '🎨',
        zones: {
            picture_text: { 
                enabled: true,
                label: 'Picture & Text'
            },
            list: { 
                enabled: true,
                label: 'List Items'
            },
            text_right: { 
                enabled: true,
                label: 'Side Notes'
            },
            free_form_content: { 
                enabled: true,
                label: 'Free Writing'
            }
        }
    }
};

export type TemplateId = keyof typeof ENTRY_TEMPLATES;

export function getTemplate(id: string): EntryTemplate | undefined {
    return ENTRY_TEMPLATES[id];
}

export function getTemplateList(): EntryTemplate[] {
    return Object.values(ENTRY_TEMPLATES);
}