<script lang="ts">
    import PrimaryButton from '$components/buttons/PrimaryButton.svelte';
    import type { LayoutProps } from './$types';
    import { goto } from '$app/navigation';

    let { data }: LayoutProps = $props();
</script>

<main>
    <div class="cta-section">
        <img
            src="/pexels-photo-3934676.webp"
            alt="Two girls smiling and looking at laptop"
            class="cta-section__image"
        />
        <div class="cta-section__text">
            <h2>Inspiring Meaningful Connection Through Writing</h2>
            <p>
                With Jurnl, you can share journal entries with trusted friends —
                turning personal reflection into shared understanding and
                connection.
            </p>
            <PrimaryButton
                text="Get Started"
                onClick={() => goto('/auth/login')}
            />
        </div>
    </div>
    <div class="cta-section">
        <div class="cta-section__text">
            <h2>Small Circle, Big Connection</h2>
            <p>
                We provide a space for you to connect meaningfully with a close
                circle — because true connection doesn’t need a crowd.
            </p>
        </div>
        <img
            src="/pexels-photo-6457576.webp"
            alt="Three people looking at laptop, 2 smiling and 1 looks concerned"
            class="cta-section__image"
        />
    </div>
    <h1 class="cta-title">Get Writing Today</h1>

    <div class="cta-title">
        <PrimaryButton
            text="Sign In to Get Started"
            onClick={() => goto('/auth/login')}
        />
    </div>
</main>
