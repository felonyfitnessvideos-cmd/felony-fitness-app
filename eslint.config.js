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
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 2024,
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
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
    files: ['scripts/**', 'supabase/functions/**'],
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
  }
])
