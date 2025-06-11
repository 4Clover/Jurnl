<script lang="ts">
    import { goto } from '$app/navigation';
    import type { IEntrySerializable } from '$schemas';
    import {
        getTemplate,
        type EntryTemplate,
    } from '$lib/types/templates.types';
    import ConfirmDialog from '$lib/components/common/ConfirmDialog.svelte';
    import Switch from '$lib/components/buttons/Switch.svelte';

    interface Props {
        journalId: string;
        templateId: string;
        entryId?: string;
        initialData?: Partial<IEntrySerializable>;
        onSuccess?: (entry: IEntrySerializable) => void;
        onTemplateChange?: (newTemplateId: string) => void;
    }

    let {
        journalId,
        templateId,
        entryId,
        initialData,
        onSuccess,
        onTemplateChange,
    }: Props = $props();

    // Get template configuration
    let template = $derived(getTemplate(templateId));

    // Zone states - Initialize with existing data if in edit mode
    let title = $state(initialData?.title || '');
    let pictureUrl = $state<string | null>(
        initialData?.content_zones?.picture_text?.image?.url || null,
    );
    let pictureAlt = $state(
        initialData?.content_zones?.picture_text?.image?.alt || '',
    );
    let pictureCaption = $state(
        initialData?.content_zones?.picture_text?.image?.caption || '',
    );
    let pictureText = $state(
        initialData?.content_zones?.picture_text?.text || '',
    );
    let listItems = $state<Array<{ text: string; checked: boolean }>>(
        initialData?.content_zones?.list?.items || [],
    );
    let textRight = $state(
        initialData?.content_zones?.text_right?.content || '',
    );
    let freeFormContent = $state(initialData?.free_form_content || '');
    let shared_with_friends = $state(
        initialData?.shared_with_friends || 'private',
    );

    // UI states
    let isSubmitting = $state(false);
    let error = $state<string | null>(null);
    let uploadingImage = $state(false);
    let showTemplateChangeDialog = $state(false);
    let pendingTemplateId = $state<string | null>(null);

    // Check if any zones have content (for template change warning)
    function hasZoneContent(zoneId: string): boolean {
        switch (zoneId) {
            case 'picture_text':
                return !!(
                    pictureUrl ||
                    pictureText ||
                    pictureAlt ||
                    pictureCaption
                );
            case 'list':
                return listItems.some((item) => item.text.trim());
            case 'text_right':
                return !!textRight.trim();
            case 'free_form_content':
                return !!freeFormContent.trim();
            default:
                return false;
        }
    }

    // Handle template change request
    function requestTemplateChange(newTemplateId: string) {
        if (!onTemplateChange) return;

        // Check if switching templates would lose data
        const newTemplate = getTemplate(newTemplateId);
        if (!newTemplate) return;

        let wouldLoseData = false;
        const currentZones = [
            'picture_text',
            'list',
            'text_right',
            'free_form_content',
        ] as const;

        for (const zone of currentZones) {
            if (hasZoneContent(zone) && !newTemplate.zones[zone]?.enabled) {
                wouldLoseData = true;
                break;
            }
        }

        if (wouldLoseData) {
            pendingTemplateId = newTemplateId;
            showTemplateChangeDialog = true;
        } else {
            onTemplateChange(newTemplateId);
        }
    }

    // Confirm template change
    function confirmTemplateChange() {
        if (pendingTemplateId && onTemplateChange) {
            // Clear data from zones that won't be in new template
            const newTemplate = getTemplate(pendingTemplateId);
            if (newTemplate) {
                if (!newTemplate.zones.picture_text.enabled) {
                    pictureUrl = null;
                    pictureAlt = '';
                    pictureCaption = '';
                    pictureText = '';
                }
                if (!newTemplate.zones.list.enabled) {
                    listItems = [];
                }
                if (!newTemplate.zones.text_right.enabled) {
                    textRight = '';
                }
                if (!newTemplate.zones.free_form_content.enabled) {
                    freeFormContent = '';
                }
            }

            onTemplateChange(pendingTemplateId);
            showTemplateChangeDialog = false;
            pendingTemplateId = null;
        }
    }

    // Cancel template change
    function cancelTemplateChange() {
        showTemplateChangeDialog = false;
        pendingTemplateId = null;
    }

    // Add a new list item
    function addListItem() {
        listItems = [...listItems, { text: '', checked: false }];
    }

    // Remove a list item
    function removeListItem(index: number) {
        listItems = listItems.filter((_, i) => i !== index);
    }

    // Update list item text
    function updateListItem(index: number, text: string) {
        listItems = listItems.map((item, i) =>
            i === index ? { ...item, text } : item,
        );
    }

    // Toggle list item checked state
    function toggleListItem(index: number) {
        listItems = listItems.map((item, i) =>
            i === index ? { ...item, checked: !item.checked } : item,
        );
    }

    // Handle image upload (placeholder - implement actual upload logic)
    async function handleImageUpload(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        uploadingImage = true;
        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                pictureUrl = e.target?.result as string;
                uploadingImage = false;
            };
            reader.readAsDataURL(file);
        } catch (err) {
            error = 'Failed to upload image';
            uploadingImage = false;
        }
    }

    // Submit the entry
    async function handleSubmit(e: Event) {
        e.preventDefault();
        if (!title.trim()) {
            error = 'Title is required';
            return;
        }

        isSubmitting = true;
        error = null;

        try {
            const entryData = {
                title: title.trim(),
                entry_date: new Date().toISOString(),
                content_zones: {
                    picture_text: {
                        image: {
                            url: pictureUrl,
                            alt: pictureAlt,
                            caption: pictureCaption,
                        },
                        text: pictureText,
                    },
                    list: {
                        items: listItems.filter((item) => item.text.trim()),
                    },
                    text_right: {
                        content: textRight,
                    },
                },
                free_form_content: freeFormContent,
                shared_with_friends: shared_with_friends,
            };

            const url = entryId
                ? `/api/journals/${journalId}/entries/${entryId}`
                : `/api/journals/${journalId}/entries`;

            const response = await fetch(url, {
                method: entryId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entryData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(
                    data.message ||
                        `Failed to ${entryId ? 'update' : 'create'} entry`,
                );
            }

            const newEntry = await response.json();

            if (onSuccess) {
                onSuccess(newEntry);
            } else {
                await goto(`/journals/${journalId}/entries/${newEntry._id}`);
            }
        } catch (err) {
            error =
                err instanceof Error ? err.message : 'Failed to create entry';
        } finally {
            isSubmitting = false;
        }
    }
</script>

<div class="templated-entry-form">
    {#if error}
        <div class="error-message" role="alert">
            {error}
        </div>
    {/if}

    {#if template}
        <div class="template-header">
            <h2>{entryId ? 'Edit' : 'Create'} {template.name}</h2>
            <p>{template.description}</p>
            {#if onTemplateChange}
                <button
                    type="button"
                    class="change-template-button"
                    onclick={() => onTemplateChange && onTemplateChange('')}
                >
                    Change Template
                </button>
            {/if}
        </div>
    {/if}

    <form onsubmit={handleSubmit}>
        <!-- Zone 1: Title -->
        <div class="zone zone-title">
            <input
                type="text"
                bind:value={title}
                placeholder="Entry Title"
                class="title-input"
                disabled={isSubmitting}
                required
            />
        </div>

        <!-- Zone 2: Picture + Text (Two Column) -->
        {#if template?.zones.picture_text.enabled}
            <div class="zone zone-picture-text">
                {#if template.zones.picture_text.label}
                    <h3 class="zone-label">
                        {template.zones.picture_text.label}
                    </h3>
                {/if}
                {#if template.zones.picture_text.description}
                    <p class="zone-description">
                        {template.zones.picture_text.description}
                    </p>
                {/if}
                <div class="picture-box">
                    {#if pictureUrl}
                        <div class="image-preview">
                            <img src={pictureUrl} alt={pictureAlt} />
                            <button
                                type="button"
                                class="remove-image"
                                onclick={() => (pictureUrl = null)}
                                disabled={isSubmitting}
                            >
                                ×
                            </button>
                        </div>
                    {:else}
                        <label class="image-upload">
                            <input
                                type="file"
                                accept="image/*"
                                onchange={handleImageUpload}
                                disabled={isSubmitting || uploadingImage}
                            />
                            <div class="upload-placeholder">
                                {#if uploadingImage}
                                    <span>Uploading...</span>
                                {:else}
                                    <span>📷 Click to add image</span>
                                {/if}
                            </div>
                        </label>
                    {/if}

                    {#if pictureUrl}
                        <input
                            type="text"
                            bind:value={pictureAlt}
                            placeholder="Image alt text"
                            class="image-field"
                            disabled={isSubmitting}
                        />
                        <input
                            type="text"
                            bind:value={pictureCaption}
                            placeholder="Image caption"
                            class="image-field"
                            disabled={isSubmitting}
                        />
                    {/if}
                </div>

                <div class="text-box">
                    <textarea
                        bind:value={pictureText}
                        placeholder="Write about your image..."
                        rows="6"
                        disabled={isSubmitting}
                    ></textarea>
                </div>
            </div>
        {/if}

        <!-- Zone 3: List -->
        {#if template?.zones.list.enabled}
            <div class="zone zone-list">
                {#if template.zones.list.label}
                    <h3 class="zone-label">{template.zones.list.label}</h3>
                {/if}
                {#if template.zones.list.description}
                    <p class="zone-description">
                        {template.zones.list.description}
                    </p>
                {/if}
                <div class="zone-header">
                    <h3>{template.zones.list.label || 'List Items'}</h3>
                    <button
                        type="button"
                        class="add-button"
                        onclick={addListItem}
                        disabled={isSubmitting}
                    >
                        + Add Item
                    </button>
                </div>

                <div class="list-items">
                    {#each listItems as item, index}
                        <div class="list-item">
                            <input
                                type="checkbox"
                                bind:checked={item.checked}
                                disabled={isSubmitting}
                            />
                            <input
                                type="text"
                                value={item.text}
                                oninput={(e) =>
                                    updateListItem(
                                        index,
                                        e.currentTarget.value,
                                    )}
                                placeholder="List item..."
                                disabled={isSubmitting}
                            />
                            <button
                                type="button"
                                class="remove-button"
                                onclick={() => removeListItem(index)}
                                disabled={isSubmitting}
                            >
                                ×
                            </button>
                        </div>
                    {/each}

                    {#if listItems.length === 0}
                        <p class="empty-state">
                            No list items yet. Click "Add Item" to start.
                        </p>
                    {/if}
                </div>
            </div>
        {/if}

        <!-- Zone 4: Text Right -->
        {#if template?.zones.text_right.enabled}
            <div class="zone zone-text-right">
                <h3>{template.zones.text_right.label || 'Additional Notes'}</h3>
                {#if template.zones.text_right.description}
                    <p class="zone-description">
                        {template.zones.text_right.description}
                    </p>
                {/if}
                <textarea
                    bind:value={textRight}
                    placeholder="Additional thoughts..."
                    rows="4"
                    disabled={isSubmitting}
                ></textarea>
            </div>
        {/if}

        <!-- Zone 5: Free Form Content -->
        {#if template?.zones.free_form_content.enabled}
            <div class="zone zone-freeform">
                <h3>
                    {template.zones.free_form_content.label || 'Free Writing'}
                </h3>
                {#if template.zones.free_form_content.description}
                    <p class="zone-description">
                        {template.zones.free_form_content.description}
                    </p>
                {/if}
                <textarea
                    bind:value={freeFormContent}
                    placeholder="Write freely here..."
                    rows="10"
                    class="freeform-textarea"
                    disabled={isSubmitting}
                ></textarea>
            </div>
        {/if}

        <!-- Zone 6: Make Public -->
        <div class="zone zone-freeform">
            <h3 class="zone-label">Share Entry</h3>
            <Switch
                bind:value={shared_with_friends}
                label=""
                design="multi"
                options={['public', 'private']}
                fontSize={14}
            />
        </div>

        <!-- Submit -->
        <div class="form-actions">
            <button
                type="button"
                class="cancel-button"
                onclick={() => window.history.back()}
                disabled={isSubmitting}
            >
                Cancel
            </button>
            <button type="submit" class="submit-button" disabled={isSubmitting}>
                {isSubmitting
                    ? entryId
                        ? 'Updating...'
                        : 'Creating...'
                    : entryId
                      ? 'Update Entry'
                      : 'Create Entry'}
            </button>
        </div>
    </form>
</div>

<ConfirmDialog
    isOpen={showTemplateChangeDialog}
    title="Change Template?"
    message="Changing the template will clear any content from sections that aren't included in the new template. This action cannot be undone."
    confirmText="Change Template"
    cancelText="Keep Current"
    variant="warning"
    onConfirm={confirmTemplateChange}
    onCancel={cancelTemplateChange}
/>
