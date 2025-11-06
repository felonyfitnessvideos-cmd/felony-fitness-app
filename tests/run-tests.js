#!/usr/bin/env node
/**
 * @fileoverview Test runner script for MyPlanPage comprehensive testing
 * @description Automated test execution with reporting and coverage analysis
 * for the MyPlanPage component and related functionality.
 * 
 * @author Felony Fitness Development Team
 * @version 1.0.0
 * @since 2025-11-04
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';

/**
 * Test execution configuration
 */
const TEST_CONFIG = {
  // Test files and patterns
  myPlanPageTest: 'tests/pages/MyPlanPage.test.jsx',
  allTests: 'tests/**/*.{test,spec}.{js,jsx,ts,tsx}',
  
  // Output directories
  reportsDir: './tests/reports',
  coverageDir: './tests/coverage',
  
  // Coverage thresholds
  coverageThreshold: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  }
};

/**
 * Ensures required directories exist
 */
function ensureDirectories() {
  if (!existsSync(TEST_CONFIG.reportsDir)) {
    mkdirSync(TEST_CONFIG.reportsDir, { recursive: true });
  }
  if (!existsSync(TEST_CONFIG.coverageDir)) {
    mkdirSync(TEST_CONFIG.coverageDir, { recursive: true });
  }
}

/**
 * Executes a command and handles output
 * @param {string} command - Command to execute
 * @param {string} description - Description for logging
 * @returns {boolean} Success status
 */
function executeCommand(command, description) {
  console.log(`\n🔄 ${description}...`);
  console.log(`Command: ${command}\n`);
  
  try {
    execSync(command, { 
      encoding: 'utf-8', 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log(`✅ ${description} completed successfully\n`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`);
    console.error(error.message);
    return false;
  }
}

/**
 * Runs MyPlanPage specific tests
 */
function runMyPlanPageTests() {
  console.log('🧪 Running MyPlanPage Component Tests');
  console.log('=====================================');
  
  const command = `npx vitest run ${TEST_CONFIG.myPlanPageTest} --reporter=verbose --coverage`;
  return executeCommand(command, 'MyPlanPage tests');
}

/**
 * Runs all tests with coverage
 */
function runAllTests() {
  console.log('🧪 Running All Tests with Coverage');
  console.log('==================================');
  
  const command = 'npx vitest run --coverage --reporter=verbose --reporter=json --reporter=html';
  return executeCommand(command, 'All tests with coverage');
}

/**
 * Runs tests in watch mode for development
 */
function runWatchMode() {
  console.log('👀 Running Tests in Watch Mode');
  console.log('==============================');
  
  const command = `npx vitest ${TEST_CONFIG.myPlanPageTest} --watch`;
  return executeCommand(command, 'Watch mode tests');
}

/**
 * Generates detailed test report
 */
function generateDetailedReport() {
  console.log('📊 Generating Detailed Test Report');
  console.log('==================================');
  
  const commands = [
    'npx vitest run --coverage --reporter=json --outputFile=./tests/reports/test-results.json',
    'npx vitest run --coverage --reporter=html --outputFile=./tests/reports/test-results.html'
  ];
  
  let success = true;
  commands.forEach((command, index) => {
    const description = `Report generation step ${index + 1}`;
    if (!executeCommand(command, description)) {
      success = false;
    }
  });
  
  return success;
}

/**
 * Runs lint checks before testing
 */
function runLintChecks() {
  console.log('🔍 Running Lint Checks');
  console.log('======================');
  
  const command = 'npm run lint';
  return executeCommand(command, 'ESLint checks');
}

/**
 * Main execution function
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'myplan';
  
  console.log('🚀 Felony Fitness Test Runner');
  console.log('=============================');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Node Version: ${process.version}`);
  console.log(`Working Directory: ${process.cwd()}\n`);
  
  // Ensure directories exist
  ensureDirectories();
  
  let success = false;
  
  switch (command) {
    case 'myplan':
    case 'myplan-page':
      success = runMyPlanPageTests();
      break;
      
    case 'all':
    case 'full':
      success = runLintChecks() && runAllTests();
      break;
      
    case 'watch':
    case 'dev':
      success = runWatchMode();
      break;
      
    case 'report':
    case 'detailed':
      success = generateDetailedReport();
      break;
      
    case 'lint':
      success = runLintChecks();
      break;
      
    case 'help':
    case '--help':
    case '-h':
      printHelp();
      return;
      
    default:
      console.error(`❌ Unknown command: ${command}`);
      printHelp();
      process.exit(1);
  }
  
  // Exit with appropriate code
  if (success) {
    console.log('\n🎉 Test execution completed successfully!');
    console.log(`📁 Reports available in: ${TEST_CONFIG.reportsDir}`);
    console.log(`📊 Coverage available in: ${TEST_CONFIG.coverageDir}`);
    process.exit(0);
  } else {
    console.log('\n💥 Test execution failed!');
    console.log('Please check the output above for details.');
    process.exit(1);
  }
}

/**
 * Prints help information
 */
function printHelp() {
  console.log(`
📖 Felony Fitness Test Runner Help
==================================

Usage: node tests/run-tests.js [command]

Commands:
  myplan, myplan-page    Run MyPlanPage component tests (default)
  all, full             Run all tests with lint checks and coverage
  watch, dev            Run tests in watch mode for development
  report, detailed      Generate detailed HTML and JSON reports
  lint                  Run ESLint checks only
  help, --help, -h      Show this help message

Examples:
  node tests/run-tests.js                    # Run MyPlanPage tests
  node tests/run-tests.js all                # Run all tests with coverage
  node tests/run-tests.js watch              # Start watch mode
  node tests/run-tests.js report             # Generate detailed reports

Coverage Thresholds:
  - Branches: ${TEST_CONFIG.coverageThreshold.branches}%
  - Functions: ${TEST_CONFIG.coverageThreshold.functions}%
  - Lines: ${TEST_CONFIG.coverageThreshold.lines}%
  - Statements: ${TEST_CONFIG.coverageThreshold.statements}%

Output Locations:
  - Test Reports: ${TEST_CONFIG.reportsDir}
  - Coverage Reports: ${TEST_CONFIG.coverageDir}
`);
}

// Execute main function
main();