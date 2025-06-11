<script lang="ts">
    import type { JournalMenuProps } from '$lib/types/journal.types';

    let { journalTitle, journalId }: JournalMenuProps = $props();
</script>

<div class="journal-menu">
    <!-- <PrimaryButton text={2025}/> -->
    <div class="journal-title-box">
        <h3>{journalTitle}</h3>
    </div>
    <div class="journal-menu-bar">
        <button
            style="width: 9.5rem; padding-right: 0.5rem; border-right: 0.03rem solid #4A571A"
        >
            <!-- <h4>new entry</h4> -->
            <a
                href="/journals/{journalId}/entries/create"
                class="create-new-entry">new entry</a
            >
        </button>
        <button aria-label="Journal Settings" style="width: 9rem;">
            <img
                src="../src/assets/journal_settings.png"
                alt="Journal settings icon"
            />
        </button>
    </div>
</div>
