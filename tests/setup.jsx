/**
 * @fileoverview Global test setup configuration
 * @description Sets up testing environment, global mocks, and utilities
 * for all test files in the Felony Fitness application.
 * 
 * @author Felony Fitness Development Team
 * @version 1.0.0
 * @since 2025-11-04
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';

/**
 * Global setup before all tests
 * Configures environment and global mocks
 */
beforeAll(() => {
  // Mock window.matchMedia for responsive design tests
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock IntersectionObserver for components that use it
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock ResizeObserver for components that use it
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock fetch for components that fetch resources (like SVGs)
  global.fetch = vi.fn((url) => {
    // Mock SVG responses for CustomMuscleMap component
    if (url.includes('.svg')) {
      return Promise.resolve({
        text: () => Promise.resolve('<svg><g id="Background"></g><g id="Biceps"></g></svg>'),
        ok: true,
        status: 200
      });
    }
    // Default mock response
    return Promise.resolve({
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
      ok: true,
      status: 200
    });
  });

  // Setup React Modal app element to prevent warnings
  const modalRoot = document.createElement('div');
  modalRoot.setAttribute('id', 'modal-root');
  document.body.appendChild(modalRoot);
  
  // Mock react-modal to prevent warnings
  vi.mock('react-modal', () => ({
    default: ({ isOpen, children, onRequestClose, ...props }) => 
      isOpen ? (
        <div data-testid="modal" role="dialog" {...props}>
          <button onClick={onRequestClose} data-testid="close-modal">Close</button>
          {children}
        </div>
      ) : null,
    setAppElement: vi.fn()
  }));

  // Mock console methods to reduce noise in tests (but allow error tracking)
  const originalError = console.error;
  console.error = (...args) => {
    // Allow test assertions on console.error calls
    if (args[0] && typeof args[0] === 'string' && args[0].includes('Warning:')) {
      return; // Suppress React warnings in tests
    }
    originalError(...args);
  };
});

/**
 * Cleanup after each test
 * Ensures test isolation and clean state
 */
afterEach(() => {
  // Cleanup React Testing Library
  cleanup();
  
  // Clear all mocks to prevent test interference
  vi.clearAllMocks();
  
  // Reset DOM to clean state
  document.body.innerHTML = '';
  document.head.innerHTML = '';
});

/**
 * Global cleanup after all tests
 * Restores original implementations and cleans up resources
 */
afterAll(() => {
  // Restore original console methods
  vi.restoreAllMocks();
  
  // Clean up any remaining timers
  vi.useRealTimers();
});