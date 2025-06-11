<style>
    .dialog-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    .dialog-content {
        background: white;
        border-radius: 12px;
        padding: 2rem;
        max-width: 480px;
        width: 90%;
        box-shadow:
            0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
        animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
        from {
            transform: translateY(-20px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    .dialog-title {
        margin: 0 0 1rem 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: #111827;
    }

    .dialog-message {
        margin: 0 0 2rem 0;
        color: #4b5563;
        line-height: 1.5;
    }

    .dialog-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
    }

    .button {
        padding: 0.75rem 1.5rem;
        border-radius: 6px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
        font-size: 0.875rem;
    }

    .button-secondary {
        background: white;
        color: #374151;
        border: 1px solid #d1d5db;
    }

    .button-secondary:hover {
        background: #f3f4f6;
    }

    .button-danger {
        background: #ef4444;
        color: white;
    }

    .button-danger:hover {
        background: #dc2626;
    }

    .button-warning {
        background: #f59e0b;
        color: white;
    }

    .button-warning:hover {
        background: #d97706;
    }

    .button-info {
        background: #3b82f6;
        color: white;
    }

    .button-info:hover {
        background: #2563eb;
    }

    .danger .dialog-title {
        color: #dc2626;
    }

    .warning .dialog-title {
        color: #d97706;
    }

    .info .dialog-title {
        color: #2563eb;
    }

    @media (max-width: 480px) {
        .dialog-content {
            padding: 1.5rem;
        }

        .dialog-actions {
            flex-direction: column-reverse;
        }

        .button {
            width: 100%;
        }
    }
</style>

<script lang="ts">
    interface Props {
        isOpen: boolean;
        title: string;
        message: string;
        confirmText?: string;
        cancelText?: string;
        onConfirm: () => void;
        onCancel: () => void;
        variant?: 'danger' | 'warning' | 'info';
    }

    let {
        isOpen = false,
        title,
        message,
        confirmText = 'Confirm',
        cancelText = 'Cancel',
        onConfirm,
        onCancel,
        variant = 'warning',
    }: Props = $props();

    function handleConfirm() {
        onConfirm();
    }

    function handleCancel() {
        onCancel();
    }

    function handleBackdropClick(e: MouseEvent) {
        if (e.target === e.currentTarget) {
            handleCancel();
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            handleCancel();
        }
    }
</script>

{#if isOpen}
    <div
        class="dialog-backdrop"
        onclick={handleBackdropClick}
        onkeydown={handleKeydown}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        tabindex="-1"
    >
        <div class="dialog-content {variant}">
            <h2 id="dialog-title" class="dialog-title">{title}</h2>
            <p class="dialog-message">{message}</p>

            <div class="dialog-actions">
                <button
                    type="button"
                    class="button button-secondary"
                    onclick={handleCancel}
                >
                    {cancelText}
                </button>
                <button
                    type="button"
                    class="button button-{variant}"
                    onclick={handleConfirm}
                >
                    {confirmText}
                </button>
            </div>
        </div>
    </div>
{/if}
