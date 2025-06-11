import type { IEntrySerializable } from '$schemas';
import { ENTRY_TEMPLATES } from '$types/templates.types';

/**
 * Check if a content zone has any data
 */
function hasZoneContent(
    entry: Partial<IEntrySerializable>,
    zoneId: string,
): boolean {
    if (!entry.content_zones) return false;

    switch (zoneId) {
        case 'picture_text': {
            const zone = entry.content_zones.picture_text;
            return !!(
                zone?.image?.url ||
                zone?.text?.trim() ||
                zone?.image?.alt?.trim() ||
                zone?.image?.caption?.trim()
            );
        }
        case 'list': {
            const items = entry.content_zones.list?.items || [];
            return items.some((item) => item.text.trim());
        }
        case 'text_right': {
            return !!entry.content_zones.text_right?.content?.trim();
        }
        case 'free_form_content': {
            return !!entry.free_form_content?.trim();
        }
        default:
            return false;
    }
}

/**
 * Detect which template best matches the existing entry data
 */
export function detectTemplateFromEntry(
    entry: Partial<IEntrySerializable>,
): string {
    // Check which zones have content
    const hasPictureText = hasZoneContent(entry, 'picture_text');
    const hasList = hasZoneContent(entry, 'list');
    const hasTextRight = hasZoneContent(entry, 'text_right');
    const hasFreeForm = hasZoneContent(entry, 'free_form_content');

    // Count active zones
    const activeZones = [
        hasPictureText,
        hasList,
        hasTextRight,
        hasFreeForm,
    ].filter(Boolean).length;

    // If no zones have content, use daily
    if (activeZones === 0) {
        return 'daily';
    }

    // Match patterns
    // Daily: Only free form content
    if (activeZones === 1 && hasFreeForm) {
        return 'daily';
    }

    // Photo Journal: Picture + optional free form
    if (hasPictureText && !hasList && !hasTextRight) {
        return 'photo';
    }

    // Task List: List + optional text right
    if (hasList && !hasPictureText && activeZones <= 2) {
        return 'tasks';
    }

    // Reflection: Multiple zones active
    if (activeZones >= 3) {
        return 'reflection';
    }

    // Default to custom for anything else
    return 'custom';
}

/**
 * Get active zones for a given entry
 */
export function getActiveZones(entry: Partial<IEntrySerializable>): string[] {
    const zones: string[] = [];

    if (hasZoneContent(entry, 'picture_text')) zones.push('picture_text');
    if (hasZoneContent(entry, 'list')) zones.push('list');
    if (hasZoneContent(entry, 'text_right')) zones.push('text_right');
    if (hasZoneContent(entry, 'free_form_content'))
        zones.push('free_form_content');

    return zones;
}

/**
 * Check if switching templates would lose data
 */
export function wouldLoseDataOnTemplateSwitch(
    entry: Partial<IEntrySerializable>,
    currentTemplateId: string,
    newTemplateId: string,
): boolean {
    const newTemplate = ENTRY_TEMPLATES[newTemplateId];
    if (!newTemplate) return false;

    const activeZones = getActiveZones(entry);

    for (const zone of activeZones) {
        // Map zone names to template zone keys
        const zoneKey =
            zone === 'free_form_content' ? 'free_form_content' : zone;
        if (
            !newTemplate.zones[zoneKey as keyof typeof newTemplate.zones]
                ?.enabled
        ) {
            return true;
        }
    }

    return false;
}
