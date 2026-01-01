import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'

// Manually extracted rules from typescriptEslint.configs.recommended
const tsRecommendedRules = {
  "@typescript-eslint/ban-ts-comment": "error",
  "no-array-constructor": "off",
  "@typescript-eslint/no-array-constructor": "error",
  "@typescript-eslint/no-duplicate-enum-values": "error",
  "@typescript-eslint/no-empty-object-type": "error",
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/no-extra-non-null-assertion": "error",
  "@typescript-eslint/no-misused-new": "error",
  "@typescript-eslint/no-namespace": "error",
  "@typescript-eslint/no-non-null-asserted-optional-chain": "error",
  "@typescript-eslint/no-require-imports": "error",
  "@typescript-eslint/no-this-alias": "error",
  "@typescript-eslint/no-unnecessary-type-constraint": "error",
  "@typescript-eslint/no-unsafe-declaration-merging": "error",
  "@typescript-eslint/no-unsafe-function-type": "error",
  "no-unused-expressions": "off",
  "@typescript-eslint/no-unused-expressions": "error",
  "no-unused-vars": "off",
  "@typescript-eslint/no-unused-vars": "error",
  "@typescript-eslint/no-wrapper-object-types": "error",
  "@typescript-eslint/prefer-as-const": "error",
  "@typescript-eslint/prefer-namespace-keyword": "error",
  "@typescript-eslint/triple-slash-reference": "error"
};


export default defineConfig([
  globalIgnores([
    'dist', 'node_modules', 'public', 'OldFiles/**/*', 'backups/**/*'
  ]),

  // Base JavaScript rules (applies to all files unless overridden)
  js.configs.recommended,

  // Configuration for JavaScript and JSX files (no TypeScript-specific parser options)
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        process: 'readonly',
        React: 'readonly', // Explicitly add React global
      },
      parser: tsParser, // Use tsParser even for JS/JSX for consistency and JSX support
      parserOptions: {
        ecmaFeatures: { jsx: true },
        // No project here, as it's for JS/JSX
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs['recommended-latest'].rules,
      ...reactRefresh.configs.recommended.rules,
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // Configure @typescript-eslint/no-unused-vars to ignore variables starting with an underscore
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }],
      'no-undef': 'error',
    },
  },

  // Configuration for main application TypeScript and TSX files (under src/)
  {
    files: ['src/**/*.{ts,tsx}'], // Only apply project to files under src/
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        project: './tsconfig.json', // Enable type-aware linting for TS files
      },
      globals: {
        ...globals.browser,
        process: 'readonly',
        React: 'readonly', // Explicitly add React global
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      ...tsRecommendedRules, // Manually apply the extracted rules
      // Override no-unused-vars from tsRecommendedRules to ignore variables starting with an underscore
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }],
    },
  },

  // Configuration for other TypeScript files (like database.types.ts, but NOT supabase/functions)
  // These files are outside src/ and might not be part of the main tsconfig.json.
  // We'll lint them as TS but without project-based rules.
  {
    files: ['**/*.ts', '!src/**/*.{ts,tsx}', '!supabase/functions/**/*.{ts,js}'], // All .ts files EXCEPT those under src/ or supabase/functions/
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        // NO project here
      },
      globals: {
        ...globals.browser,
        process: 'readonly',
        NodeJS: 'readonly', // Add NodeJS global if these are also Node.js related
        console: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      ...tsRecommendedRules, // Apply recommended rules, but without project context
      // Override no-unused-vars from tsRecommendedRules to ignore variables starting with an underscore
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }],
    },
  },

  // Configuration for project-level JavaScript files (like eslint.config.js, vite.config.js)
  {
    files: ['*.js', '*.config.js', '*.mjs'], // Target JavaScript config files
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.node, // Ensure Node.js globals for config files
        NodeJS: 'readonly', // Add NodeJS global
        console: 'readonly', // Explicitly allow console for these files
      },
      // Do NOT set parserOptions.project here
    },
    rules: {
      'no-console': 'off', // Allow console in config files
      'no-undef': 'error', // Ensure basic undef checks
    },
  },

  // Test files configuration (re-introducing with tsParser for TS/TSX files)
  {
    files: ['**/*.test.{js,jsx,ts,tsx}', '**/test/**/*.{js,jsx,ts,tsx}', '**/tests/**/*.{js,jsx,ts,tsx}', '**/src/__tests__/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        vi: 'readonly',
        global: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        jest: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        React: 'readonly', // Explicitly add React global for tests
        NodeJS: 'readonly', // Explicitly add NodeJS global for tests
        console: 'readonly',
      },
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
        '@typescript-eslint': typescriptEslint,
    },
    rules: {
      'no-unused-vars': ['error', {
        varsIgnorePattern: '^[A-Z_]|^_',
        argsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_'
      }],
    },
  },

  // Node scripts
  {
    files: ['scripts/**/*.{js,mjs}', 'lighthouserc.js'], // Specific Node scripts, excluding config files covered above
    languageOptions: {
      globals: {
        ...globals.node,
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        NodeJS: 'readonly', // Add NodeJS global
        console: 'readonly', // Allow console for scripts
      },
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
      },
    },
    rules: {
      'no-console': 'off'
    }
  },

  // Supabase Edge Functions
  {
    files: ['supabase/functions/**/*.{js,ts}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        Deno: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        Headers: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        URLPattern: 'readonly',
        fetch: 'readonly',
        console: 'readonly',
        crypto: 'readonly',
        TextEncoder: 'readonly',
        TextDecoder: 'readonly',
        JSON: 'readonly',
        Promise: 'readonly',
        Error: 'readonly',
        RegExp: 'readonly',
        NodeJS: 'readonly', // Add NodeJS global if needed
        getCurrentUserId: 'readonly', // Add Supabase global
      },
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
        // REMOVED project: './tsconfig.json'
      },
    },
    plugins: {
        '@typescript-eslint': typescriptEslint,
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': ['error', { args: 'none', varsIgnorePattern: '^_' }],
      'no-undef': 'error',
    }
  }
])