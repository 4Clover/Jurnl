import { svelteTesting } from '@testing-library/svelte/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

// TODO: SITE CONFIG WEBSITES

export default defineConfig(({ mode }) => ({
    plugins: [
        sveltekit(),
        {
            name: 'dev-timing',
            buildStart() {
                console.time('Build Time');
            },
            buildEnd() {
                console.timeEnd('Build Time');
            },
        },
    ],
    // CSS configuration (moved from svelte.config.js)
    css: {
        preprocessorOptions: {
            scss: {
                // additionalData: '@import "src/styles/variables.scss";',
                charset: false, // Disable charset injection for faster builds
            },
        },
        devSourcemap: true, // Enable CSS source maps in dev
    },

    server: {
        port: 3000,
        strictPort: false,
        open: true, // Don't auto-open browser (saves startup time)
        host: true, // Specific localhost binding (faster than 'true')
        hmr: {
            overlay: true,
            port: 3000, // Separate HMR port
        },
        fs: {
            strict: false, // Allow serving files outside root
            allow: ['..'], // Allow parent directory access
        },
        watch: {
            usePolling: false, // Use native file watching (faster on WSL2)
            interval: 100, // Polling interval if needed
            ignored: [
                '**/node_modules/**',
                '**/.git/**',
                '**/dist/**',
                '**/.svelte-kit/**',
                '**/coverage/**',
            ],
        },
    },

    build: {
        target: 'esnext',
        sourcemap: false, // Disable in production for faster builds
        cssMinify: 'esbuild', // Faster CSS minification
        minify: 'esbuild', // Faster JS minification
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    // Dynamic chunking strategy
                    if (id.includes('node_modules')) {
                        if (id.includes('svelte')) return 'svelte-vendor';
                        if (id.includes('mongoose')) return 'mongoose';
                        if (id.includes('@sveltejs')) return 'sveltekit-vendor';
                        return 'vendor';
                    }
                    if (id.includes('src/lib/server')) return 'server-utils';
                    if (id.includes('src/lib/components')) return 'components';
                },
            },
        },
        chunkSizeWarningLimit: 1000,
    },

    optimizeDeps: {
        // Include dependencies that should be pre-bundled
        include: [
            // Add any slow-to-transform dependencies
        ],
        exclude: [
            '@sveltejs/kit',
            'svelte',
            'vite',
            '@testing-library/svelte',
            'mongoose',
        ],
        esbuildOptions: {
            target: 'esnext',
            supported: {
                'top-level-await': true,
            },
        },
    },

    resolve: {
        dedupe: ['svelte'], // Prevent duplicate Svelte instances
        conditions: mode === 'test' ? ['browser'] : undefined,
    },

    // Enhanced dependency optimization
    ssr: {
        external: ['mongoose'], // Bundle mongoose for SSR
    },

    test: {
        globals: true,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json-summary'], // Reduced reporters for speed
            exclude: [
                '**/*.d.ts',
                '**/*.config.*',
                '**/node_modules/**',
                '**/dist/**',
                '**/.svelte-kit/**',
            ],
        },
        workspace: [
            {
                extends: './vite.config.ts',
                plugins: [svelteTesting()],
                test: {
                    name: 'client',
                    environment: 'jsdom',
                    clearMocks: true,
                    include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
                    exclude: ['src/lib/server/**'],
                    setupFiles: ['./vitest-setup-client.ts'],
                    isolate: false, // Faster test runs
                },
            },
            {
                extends: './vite.config.ts',
                test: {
                    name: 'server',
                    environment: 'node',
                    include: ['src/**/*.{test,spec}.{js,ts}'],
                    exclude: ['src/**/*.svelte.{test,spec}.{js,ts}'],
                    isolate: false, // Faster test runs
                },
            },
        ],
    },
}));
