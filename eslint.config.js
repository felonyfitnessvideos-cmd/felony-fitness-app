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
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  // Lint Node scripts with a Node environment and appropriate parser options
  {
    files: ['scripts/**', 'supabase/functions/**'],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    env: { node: true },
    rules: {
      // Allow commonjs style in scripts where necessary
      'no-console': 'off'
    }
  }
])
