import eslintJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import svelteParser from 'svelte-eslint-parser'; // Explicitly needed for the parser option
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier'; // Turns off ESLint rules that conflict with Prettier
import globals from 'globals';
import { includeIgnoreFile } from '@eslint/compat';
import { fileURLToPath } from 'node:url';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default tseslint.config(
    includeIgnoreFile(gitignorePath), // Use .gitignore for ignores

    // ignore config files, its too much hassle
    {
        ignores: [
            'eslint.config.js',
            'vite.config.ts', // Or .js
            'svelte.config.js',
            'tailwind.config.js',
            'vitest-setup-client.ts',
            // Add any other root config files here
        ],
    },

    // Base ESLint and TypeScript Recommended Rules
    eslintJs.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,

    // Global Language Options & Rules
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
            parserOptions: {
                project: './tsconfig.eslint.json', // Path to your tsconfig.json
                tsconfigRootDir: import.meta.dirname,
                extraFileExtensions: ['.svelte'], // Important for TypeScript ESLint to recognize .svelte files
            },
        },
        rules: {
            // Add any global rule overrides here
        },
    },

    // Svelte Specific Configuration
    {
        files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
        plugins: {
            svelte,
        },
        languageOptions: {
            parser: svelteParser,
            parserOptions: {
                parser: tseslint.parser, // Use TypeScript parser for <script> tags
                project: './tsconfig.eslint.json', // Ensure type info is available for Svelte script blocks
                tsconfigRootDir: import.meta.dirname,
                // svelteConfig, // Pass svelte.config.js if needed by plugins or for aliases
                projectService: true, // Recommended by SvelteKit for better editor integration
                extraFileExtensions: ['.svelte'],
            },
        },
        rules: {
            ...svelte.configs.recommended.rules, // Svelte recommended rules
        },
    },
    // Prettier Compatibility (MUST be LAST or after rule-defining configs)
    prettier, // General Prettier compatibility
    ...svelte.configs.prettier.map((config) => ({
        // Svelte specific Prettier compatibility
        ...config,
    }))
);
