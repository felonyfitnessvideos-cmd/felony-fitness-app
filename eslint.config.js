import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // Centralized ignore patterns (migrated from .eslintignore)
  globalIgnores(['dist', 'node_modules', 'public']),
  {
    // Additional explicit ignores via top-level `ignores` for clarity
    ignores: ['*.log'],
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      // Consolidated ECMAScript target for project
      ecmaVersion: 2024,
      globals: {
        ...globals.browser,
        // Allow import.meta for Vite environment
        'import': 'readonly',
      },
      parserOptions: {
        ecmaVersion: 2024,
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'no-undef': 'error',
    },
  },
  // Test files configuration
  {
    files: ['**/*.test.{js,jsx}', '**/test/**/*.{js,jsx}', '**/src/test/**/*.{js,jsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        vi: 'readonly',
        global: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  // Lint Node scripts with a Node environment and appropriate parser options
  // Ensure scripts and backend functions are linted with Node globals and
  // do NOT receive browser globals from the top-level override above.
  {
    files: ['scripts/**/*.{js,mjs}'],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
      },
    },
    rules: {
      // Allow commonjs style in scripts where necessary
      'no-console': 'off'
    }
  },
  // Supabase Edge Functions (Deno environment)
  {
    files: ['supabase/functions/**/*.{js,ts}'],
    languageOptions: {
      globals: {
        ...globals.browser, // Basic globals
        Deno: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        Headers: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        fetch: 'readonly',
      },
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
      },
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': ['error', { args: 'none', varsIgnorePattern: '^_' }],
      // Disable undef for TypeScript files since TypeScript handles this
      'no-undef': 'off',
    }
  }
])
