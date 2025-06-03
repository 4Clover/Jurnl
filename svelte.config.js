import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
// TODO: SITE CONFIG WEBSITES
/** @type {import('@sveltejs/kit').Config} */
export default {
    // Preprocessor configuration
    preprocess: vitePreprocess(),

    // SvelteKit configuration
    kit: {
        adapter: adapter(),

        env: {
            dir: '.',
            publicPrefix: 'PUBLIC_',
        },

        csp: {
            mode: 'auto',
            directives: {
                'script-src': ['self'],
            },
        },

        files: {
            assets: 'static',
            lib: 'src/lib',
            routes: 'src/routes',
            serviceWorker: 'src/service-worker',
            appTemplate: 'src/app.html',
            errorTemplate: 'src/error.html',
        },

        alias: {
            $lib: 'src/lib',
            $routes: 'src/routes',
            $types: 'src/lib/types',
            $auth: 'src/lib/server/auth',
            $components: 'src/lib/components',
            $server: 'src/lib/server',
            $database: 'src/lib/server/database',
            $schemas: 'src/lib/server/database/schemas',
            $styles: 'src/styles',
            $assets: 'src/assets',
        },
    },

    // Compiler options
    compilerOptions: {
        runes: true,
        hydratable: true,
        enableSourcemap: true,
    },
};

