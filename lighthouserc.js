/* eslint-env node */
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'Local:',
      startServerReadyTimeout: 30000,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', {minScore: 0.8}],
        'categories:accessibility': ['error', {minScore: 0.9}],
        'categories:best-practices': ['warn', {minScore: 0.8}],
        'categories:seo': ['warn', {minScore: 0.8}],
        'categories:pwa': 'off', // PWA not required for now
        
        // Performance budgets
        'resource-summary:script:size': ['error', {maxNumericValue: 200000}], // 200KB JS
        'resource-summary:stylesheet:size': ['warn', {maxNumericValue: 50000}], // 50KB CSS
        'resource-summary:image:size': ['warn', {maxNumericValue: 500000}], // 500KB images
        'resource-summary:total:size': ['warn', {maxNumericValue: 1000000}], // 1MB total
        
        // Core Web Vitals
        'largest-contentful-paint': ['warn', {maxNumericValue: 2500}],
        'first-contentful-paint': ['warn', {maxNumericValue: 1800}],
        'cumulative-layout-shift': ['warn', {maxNumericValue: 0.1}],
        'total-blocking-time': ['warn', {maxNumericValue: 200}],
        
        // Security & Best Practices
        'uses-https': 'error',
        'vulnerabilities': 'error',
        'no-vulnerable-libraries': 'error',
      }
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};