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
