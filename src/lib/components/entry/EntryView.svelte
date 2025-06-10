<script lang="ts">
    import type { IEntrySerializable } from '$schemas';

    interface Props {
        entry: IEntrySerializable;
    }

    let { entry }: Props = $props();

    const entryDate = new Date(entry.entry_date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
</script>

<article class="entry-view">
    <!-- Entry Header -->
    <header class="entry-header">
        <h1>{entry.title}</h1>
        <time datetime={entry.entry_date}>{entryDate}</time>
    </header>
    
    <!-- Zone 2: Picture + Text -->
    {#if entry.content_zones.picture_text.image.url || entry.content_zones.picture_text.text}
        <section class="zone-picture-text">
            {#if entry.content_zones.picture_text.image.url}
                <figure class="image-container">
                    <img
                        src={entry.content_zones.picture_text.image.url}
                        alt={entry.content_zones.picture_text.image.alt}
                    />
                    {#if entry.content_zones.picture_text.image.caption}
                        <figcaption>{entry.content_zones.picture_text.image.caption}</figcaption>
                    {/if}
                </figure>
            {/if}
            
            {#if entry.content_zones.picture_text.text}
                <div class="text-content">
                    <p>{entry.content_zones.picture_text.text}</p>
                </div>
            {/if}
        </section>
    {/if}
    
    <!-- Zone 3: List -->
    {#if entry.content_zones.list.items.length > 0}
        <section class="zone-list">
            <ul class="content-list">
                {#each entry.content_zones.list.items as item}
                    <li class:checked={item.checked}>
                        {#if item.checked}
                            <span class="checkmark">✓</span>
                        {/if}
                        <span class="item-text">{item.text}</span>
                    </li>
                {/each}
            </ul>
        </section>
    {/if}
    
    <!-- Zone 4: Text Right -->
    {#if entry.content_zones.text_right.content}
        <section class="zone-text-right">
            <div class="text-content">
                <p>{entry.content_zones.text_right.content}</p>
            </div>
        </section>
    {/if}
    
    <!-- Zone 5: Free Form Content -->
    {#if entry.free_form_content}
        <section class="zone-freeform">
            <div class="rich-content">
                {@html entry.free_form_content}
            </div>
        </section>
    {/if}
    
    <!-- Entry Footer -->
    <footer class="entry-footer">
        <div class="metadata">
            <span>Created: {new Date(entry.createdAt).toLocaleDateString()}</span>
            {#if entry.updatedAt !== entry.createdAt}
                <span>Updated: {new Date(entry.updatedAt).toLocaleDateString()}</span>
            {/if}
        </div>
    </footer>
</article>

<style>
    .entry-view {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
        background: white;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .entry-header {
        text-align: center;
        margin-bottom: 3rem;
        padding-bottom: 2rem;
        border-bottom: 2px solid #e5e7eb;
    }

    .entry-header h1 {
        font-size: 2.5rem;
        font-weight: 700;
        color: #111827;
        margin: 0 0 0.5rem 0;
    }

    .entry-header time {
        color: #6b7280;
        font-size: 1.125rem;
    }

    /* Zone Styles */
    section {
        margin-bottom: 3rem;
    }

    .zone-picture-text {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
        align-items: start;
    }

    .image-container {
        text-align: center;
    }

    .image-container img {
        width: 100%;
        height: auto;
        border-radius: 8px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .image-container figcaption {
        margin-top: 0.5rem;
        font-size: 0.875rem;
        color: #6b7280;
        font-style: italic;
    }

    .text-content {
        padding: 1rem;
        background: #f9fafb;
        border-radius: 8px;
    }

    .text-content p {
        margin: 0;
        line-height: 1.6;
        color: #374151;
    }

    /* List Styles */
    .content-list {
        list-style: none;
        padding: 0;
        margin: 0;
        background: #f9fafb;
        border-radius: 8px;
        padding: 1rem;
    }

    .content-list li {
        display: flex;
        align-items: center;
        padding: 0.5rem 0;
        border-bottom: 1px solid #e5e7eb;
    }

    .content-list li:last-child {
        border-bottom: none;
    }

    .content-list li.checked .item-text {
        text-decoration: line-through;
        color: #9ca3af;
    }

    .checkmark {
        color: #10b981;
        font-weight: bold;
        margin-right: 0.5rem;
        font-size: 1.125rem;
    }

    /* Rich Content */
    .rich-content {
        padding: 2rem;
        background: #f9fafb;
        border-radius: 8px;
        line-height: 1.8;
        font-size: 1.0625rem;
    }

    .rich-content :global(p) {
        margin-bottom: 1rem;
    }

    .rich-content :global(p:last-child) {
        margin-bottom: 0;
    }

    .rich-content :global(ul),
    .rich-content :global(ol) {
        margin: 1rem 0 1rem 2rem;
    }

    .rich-content :global(h1),
    .rich-content :global(h2),
    .rich-content :global(h3) {
        margin-top: 1.5rem;
        margin-bottom: 0.75rem;
        font-weight: 600;
    }

    /* Footer */
    .entry-footer {
        margin-top: 3rem;
        padding-top: 2rem;
        border-top: 1px solid #e5e7eb;
    }

    .metadata {
        display: flex;
        justify-content: center;
        gap: 2rem;
        color: #6b7280;
        font-size: 0.875rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .zone-picture-text {
            grid-template-columns: 1fr;
        }

        .entry-header h1 {
            font-size: 2rem;
        }
    }
</style>