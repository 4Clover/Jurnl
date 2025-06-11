<style>
    .google-login-button {
        background-color: #ffffff;
        color: #4285f4;
        border: 1px solid #dadce0;
        box-shadow:
            0 1px 2px 0 rgba(60, 64, 67, 0.3),
            0 1px 3px 1px rgba(60, 64, 67, 0.15);
        width: 100%;
        max-width: 320px;
        padding: 12px 24px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 16px;
        font-weight: 500;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
    }
    .google-login-button:hover {
        background-color: #f8f9fa;
        border-color: #c6c6c6;
        box-shadow:
            0 2px 4px 0 rgba(60, 64, 67, 0.3),
            0 1px 6px 1px rgba(60, 64, 67, 0.15);
    }

    .welcome-text {
        color: #5f6368;
        margin-bottom: 32px;
        font-size: 16px;
        line-height: 1.5;
    }
</style>

<script lang="ts">
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();

    // Construct Google OAuth URL with redirect parameter
    const googleLoginUrl = `/auth/login/google${data.redirectTo ? `?redirectTo=${encodeURIComponent(data.redirectTo)}` : ''}`;
</script>

<main class="center-container">
    <div class="login-box">
        <div class="spacing"></div>
        <h2 class="center-item title">Welcome to Jurnl</h2>
        
        <div class="center-item welcome-text">
            Sign in with your Google account to start journaling
        </div>

        <div class="center-item">
            <a href={googleLoginUrl} class="google-login-button">
                <img
                    src="/google-logo.svg.webp"
                    alt="Google logo"
                    style="height: 20px; margin-right: 12px;"
                />
                Continue with Google
            </a>
        </div>

        <div class="spacing"></div>
    </div>
</main>
