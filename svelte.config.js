import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
/** @type {import('@sveltejs/kit').Config} */

const config = {
    preprocess: vitePreprocess(),
    kit: { adapter: adapter() },
    alias: {
        lib: './src/lib',
        routes: './src/routes',
        types: './src/lib/types',
        auth: './src/lib/server/auth',
        components: './src/lib/components',
        server: './src/lib/server',
        database: './src/lib/server/database',
        schemas: './src/lib/server/database/schemas',
    },
    compilerOptions: {
        runes: true,
    },
};

export default config;
