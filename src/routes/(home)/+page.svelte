<script lang="ts">
    import PrimaryButton from '$lib/components/buttons/PrimaryButton.svelte';
import type { LayoutProps } from './$types';

    let { data }: LayoutProps = $props();
</script>

<main>
    <div class="cta-section">
        <img src="https://images.pexels.com/photos/3934676/pexels-photo-3934676.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Two girls smiling and looking at laptop" class="cta-section__image"/>
        <div class="cta-section__text">
            <h2>Inspiring Meaningful Connection Through Writing</h2>
            <p>With Jurnl, you can share journal entries with trusted friends — turning personal reflection into shared understanding and connection.</p>
            <PrimaryButton text="Get Started" onClick={() => (window.location.href = '/auth/register')}/>

        </div>
    </div>
    <div class="cta-section">
        <div class="cta-section__text">
            <h2>Small Circle, Big Connection</h2>
            <p>We provide a space for you to connect meaningfully with a close circle — because true connection doesn’t need a crowd.</p>
        </div>
         <img src="https://images.pexels.com/photos/6457576/pexels-photo-6457576.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Three people looking at laptop, 2 smiling and 1 looks concerned" class="cta-section__image"/>
    </div>
    <h1 class="cta-title">Get Writing Today</h1>
    
    <div class="cta-title">
        <PrimaryButton text="Sign Up for an Account" onClick={() => (window.location.href = '/auth/register')}/>
    </div>
</main>
