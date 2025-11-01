/**
 * @file performance.js
 * @description Performance optimization utilities for client-side enhancements
 * @project Felony Fitness
 * 
 * This module provides various performance optimization utilities including:
 * - Route prefetching for critical paths
 * - Lazy image loading with Intersection Observer
 * - Service Worker registration for caching
 * - Performance monitoring and metrics collection
 */

/**
 * Critical routes that should be prefetched for better navigation performance
 * @type {string[]}
 */
const criticalRoutes = ['/dashboard', '/workouts', '/nutrition'];

/**
 * Prefetches critical routes after main app loads to improve navigation performance
 * Uses requestIdleCallback to avoid blocking the main thread
 * Only prefetches in production to avoid development issues
 * @returns {void}
 */
export const prefetchCriticalRoutes = () => {
  // Only prefetch in production builds
  if ('requestIdleCallback' in window && import.meta.env.PROD) {
    requestIdleCallback(() => {
      criticalRoutes.forEach(route => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        document.head.appendChild(link);
      });
    });
  }
};

/**
 * Implements lazy loading for images using Intersection Observer API
 * Images with data-src attribute will be loaded when they enter the viewport
 * @returns {void}
 */
export const lazyLoadImages = () => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
};

/**
 * Registers a service worker for caching and offline functionality
 * Only registers in production builds to avoid development issues
 * @returns {Promise<void>}
 */
export const registerSW = async () => {
  // Only register service worker in production
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    try {
      await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });
    } catch (error) {
      console.warn('SW registration failed:', error);
    }
  }
};

/**
 * Monitors performance metrics using the Performance API
 * Logs timing information for Core Web Vitals and resource loading
 * @returns {void}
 */
export const monitorPerformance = () => {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.loadTime > 1000) {
          console.warn(`Slow resource: ${entry.name} (${entry.loadTime}ms)`);
        }
      });
    });
    
    observer.observe({ entryTypes: ['resource'] });
  }
};

/**
 * Initializes all performance optimizations after initial render
 * Combines route prefetching, image lazy loading, SW registration, and monitoring
 * @returns {void}
 */
export const initPerformanceOptimizations = () => {
  // Run after initial render
  setTimeout(() => {
    prefetchCriticalRoutes();
    lazyLoadImages();
    registerSW();
    
    if (import.meta.env.MODE === 'development') {
      monitorPerformance();
    }
  }, 1000);
};
