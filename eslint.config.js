import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import sveltePlugin from 'eslint-plugin-svelte';
import prettierConfig from 'eslint-config-prettier'; // Disables ESLint rules conflicting with Prettier
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// TODO: SITE CONFIG WEBSITES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default tseslint.config(
    // Use tseslint.config() for a streamlined setup, it's an array builder
    // 1. Global ignores
    {
        ignores: [
            '**/node_modules/',
            '.DS_Store',
            '**/.svelte-kit/', // SvelteKit build/dev output
            '**/build/', // General build output
            '**/dist/', // General distribution output
            '**/package/', // For npm pack output
            '**/coverage/', // Test coverage reports
            'eslint.config.js', // Ignore this configuration file itself
            'vite.config.ts',
            'svelte.config.js',
            'postcss.config.js',
            '.gitignore',
            // Add any other project-specific ignores here (e.g., "*.log", "temp/")
        ],
    },

    // 2. ESLint recommended base (for .js files primarily)
    js.configs.recommended,

    // 3. TypeScript core configuration (applies to .ts, .tsx, .mts, .cts files)
    // -- includes tseslint.parser and tseslint.plugin
    ...tseslint.configs.recommendedTypeChecked, // Type-aware linting rules, more comprehensive
    // ...tseslint.configs.stylisticTypeChecked, // Optional: for stylistic rules that require type info

    // 4. Specific overrides for TypeScript files and parserOptions
    // This ensures all TypeScript files are configured for type-aware linting.
    {
        files: ['**/*.{ts,mts,cts}'],
        languageOptions: {
            parserOptions: {
                project: true, // Automatically find and use tsconfig.json
                tsconfigRootDir: __dirname, // Root directory for tsconfig.json discovery
                extraFileExtensions: ['.svelte'], // Important for <script lang="ts"> in Svelte files
            },
        },
        rules: {
            // Your project-specific TypeScript rule overrides can go here
            // Example: '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            // '@typescript-eslint/no-explicit-any': 'warn', // Consider project needs
        },
    },

    // 5. Svelte specific configuration
    // Start with eslint-plugin-svelte's recommended flat configurations
    ...sveltePlugin.configs['flat/recommended'],
    // Then, add specific overrides or parser configurations for Svelte files
    {
        files: ['**/*.svelte'],
        languageOptions: {
            // svelte-eslint-parser is typically set by sveltePlugin.configs['flat/recommended']
            // We need to configure its parserOptions for TypeScript within <script> tags
            parserOptions: {
                parser: tseslint.parser, // Use the TypeScript parser for <script lang="ts">
                project: true, // Enable type-aware linting within Svelte scripts
                tsconfigRootDir: __dirname,
                extraFileExtensions: ['.svelte'], // Ensure TS parser processes Svelte files
                svelteFeatures: {
                    // As per your project guidelines
                    runes: true,
                },
            },
            globals: {
                ...globals.browser, // Svelte components are primarily browser-based
            },
        },
        rules: {
            // Override or add Svelte specific rules if needed
            //      e.g.
            //      'svelte/no-at-html-tags': 'warn',
            //      'svelte/comment-directive': ['warn', { reportUnusedDisableDirectives: true }],
        },
    },

    // 6. Environment-specific configurations

    // Server-side code (Node.js environment)
    // Covers src/lib/server, hooks, and +server.ts files
    {
        files: [
            'src/lib/server/**/*.ts',
            'src/hooks.server.ts',
            'src/routes/**/+server.ts',
            'src/routes/**/+page.server.ts', // For server-side load functions and form actions
        ],
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
        rules: {
            // Add any rules specific to your Node.js server environment
            // e.g. if you allow console logs on the server: 'no-console': 'off',
        },
    },

    // Client-side specific TypeScript/JavaScript files
    // Covers general lib utils (not in server), +page.ts, +layout.ts
    {
        files: [
            'src/lib/**/*.ts',
            'src/routes/**/+page.ts',
            'src/routes/**/+layout.ts',
            'src/app.d.ts', // TypeScript ambient declarations
        ],
        ignores: [
            // Exclude files already specifically handled by the server config
            'src/lib/server/**/*.ts',
            'src/hooks.server.ts',
            'src/routes/**/+server.ts',
            'src/routes/**/+page.server.ts',
        ],
        languageOptions: {
            globals: {
                ...globals.browser,
            },
        },
    },

    // Test files configuration (Vitest)
    // As per your guidelines: ComponentName.svelte.test.ts and filename.test.ts
    {
        files: [
            '**/*.test.ts', // For general .ts test files (e.g., src/lib/server/utils.test.ts)
            '**/*.svelte.test.ts', // For Svelte component tests
            'tests/**/*.ts', // A common pattern for end-to-end or integration tests
        ],
        languageOptions: {
            globals: {
                ...globals.vitest, // Vitest specific globals (describe, it, expect, etc.)
                ...globals.node, // Server tests run in a Node.js environment
                ...globals.browser, // Client component tests might use browser globals
            },
        },
        rules: {
            // Relax or adjust rules for test files if necessary
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-floating-promises': 'off', // Common in async tests
            // Consider adding eslint-plugin-vitest for Vitest-specific rules if desired
        },
    },

    // 7. Global linter options (applies to all linted files)
    {
        linterOptions: {
            reportUnusedDisableDirectives: 'warn', // Or "error" for stricter checking
        },
    },

    // 8. Prettier - MUST BE THE LAST CONFIG in the array.
    // This turns off all ESLint rules that are unnecessary or might conflict with Prettier.
    prettierConfig,
);
