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
      'tests/**/*.{test,spec}.{js,jsx,ts,tsx}'
    ],

    // File patterns to exclude from testing
    exclude: [
      'node_modules',
      'dist',
      'build',
      'OldFiles'
    ],

    // Global variables available in tests
    globals: true,

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
        'src/**/*.d.ts'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },

    // Test timeout configuration
    testTimeout: 10000,
    hookTimeout: 10000,

    // Reporters for test output (simplified for CI compatibility)
    reporter: ['verbose', 'json'],

    // Output directory for test reports
    outputFile: {
      json: './tests/reports/test-results.json'
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