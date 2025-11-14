/**
 * @fileoverview Vitest configuration for MyPlanPage and other component tests
 * @description Configuration file for running tests with proper environment setup,
 * mocks, and coverage reporting for the Felony Fitness application.
 * 
 * @author Felony Fitness Development Team
 * @version 1.0.0
 * @since 2025-11-04
 */

import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    // Test environment configuration
    environment: 'jsdom',

    // Global test setup files
    setupFiles: ['./tests/setup.jsx'],

    // File patterns for test discovery
    include: [
      'tests/**/*.{test,spec}.{js,jsx,ts,tsx}',
      'src/**/*.{test,spec}.{js,jsx,ts,tsx}'
    ],

    // File patterns to exclude from testing
    exclude: [
      'node_modules',
      'dist',
      'build',
      'OldFiles',
      '**/*.d.ts'
    ],

    // Global variables available in tests
    globals: true,

    // Pool configuration to prevent timeouts
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
        isolate: true
      }
    },

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './tests/coverage',
      include: [
        'src/**/*.{js,jsx,ts,tsx}'
      ],
      exclude: [
        'src/main.jsx',
        'src/**/*.test.{js,jsx,ts,tsx}',
        'src/**/*.spec.{js,jsx,ts,tsx}',
        'src/supabaseClient.js',
        'src/**/*.d.ts',
        'src/database.types.ts',
        'src/types/**'
      ],
      thresholds: {
        global: {
          branches: 60,
          functions: 60,
          lines: 60,
          statements: 60
        }
      },
      all: true
    },

    // Test timeout configuration (increased for slower CI environments)
    testTimeout: 30000,
    hookTimeout: 30000,

    // Reporters for test output
    reporter: ['verbose', 'json'],

    // Output directory for test reports
    outputFile: {
      json: './tests/reports/test-results.json'
    },

    // Retry configuration for flaky tests
    retry: 0,

    // Bail after first failure (faster feedback)
    bail: 0,

    // Run tests in sequence for stability
    sequence: {
      shuffle: false
    }
  },

  // Resolve configuration for imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './tests')
    }
  },

  // Define configuration for different environments
  define: {
    'process.env.NODE_ENV': '"test"'
  }
});