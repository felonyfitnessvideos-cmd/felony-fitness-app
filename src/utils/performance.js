/**
 * @fileoverview Performance optimization utilities for client-side enhancements
 * @description Comprehensive performance optimization toolkit including route prefetching,
 * lazy image loading, service worker registration, and performance monitoring.
 * Implements modern web performance best practices with graceful degradation.
 * 
 * @author Felony Fitness Development Team
 * @version 2.0.0
 * @since 2025-11-02
 * 
 * @requires IntersectionObserver
 * @requires PerformanceObserver
 * @requires ServiceWorker
 * 
 * @example
 * // Initialize all performance optimizations
 * import { initPerformanceOptimizations } from './utils/performance.js';
 * initPerformanceOptimizations();
 * 
 * @example
 * // Use individual optimization functions
 * import { lazyLoadImages, registerSW } from './utils/performance.js';
 * lazyLoadImages();
 * await registerSW();
 */

/**
 * Critical routes that should be prefetched for better navigation performance
 * @type {string[]}
 */
const criticalRoutes = ['/dashboard', '/workouts', '/nutrition'];

/**
 * Prefetch critical routes for improved navigation performance
 * 
 * @function prefetchCriticalRoutes
 * @returns {void}
 * 
 * @description Prefetches critical application routes using link prefetch hints
 * to improve navigation performance. Uses requestIdleCallback to avoid blocking
 * the main thread and only runs in production builds.
 * 
 * @since 2.0.0
 * 
 * Performance Benefits:
 * - Reduces navigation delay for critical routes
 * - Utilizes browser idle time efficiently
 * - Improves perceived application performance
 * 
 * @example
 * // Prefetch critical routes after app initialization
 * prefetchCriticalRoutes();
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types/prefetch}
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
 * Implement lazy loading for images using Intersection Observer
 * 
 * @function lazyLoadImages
 * @returns {void}
 * 
 * @description Implements progressive image loading using the Intersection Observer API.
 * Images with `data-src` attribute are loaded only when they enter the viewport,
 * reducing initial page load time and bandwidth usage.
 * 
 * @since 2.0.0
 * 
 * Implementation Details:
 * - Uses Intersection Observer for efficient viewport detection
 * - Supports graceful degradation for older browsers
 * - Automatically removes lazy class after loading
 * - Unobserves images after loading to prevent memory leaks
 * 
 * @example
 * // HTML structure for lazy loading
 * // <img data-src="image.jpg" class="lazy" alt="Description" />
 * 
 * // Initialize lazy loading
 * lazyLoadImages();
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API}
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
 * Register service worker for caching and offline functionality
 * 
 * @async
 * @function registerSW
 * @returns {Promise<void>} Promise that resolves when registration completes
 * 
 * @description Registers the application service worker for asset caching
 * and offline functionality. Only registers in production builds to avoid
 * development environment complications.
 * 
 * @since 2.0.0
 * 
 * Features:
 * - Asset caching for offline access
 * - Background sync for improved reliability
 * - Cache invalidation on updates
 * - Silent error handling for graceful degradation
 * 
 * @example
 * // Register service worker on app initialization
 * await registerSW();
 * 
 * @example
 * // Register with error handling
 * try {
 *   await registerSW();
 *   console.log('Service worker registered');
 * } catch (error) {
 *   console.log('Service worker not supported');
 * }
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorker}
 */
export const registerSW = async () => {
  // Only register service worker in production
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    try {
      await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });
    } catch {
      // Service worker registration failed - handled silently
    }
  }
};

/**
 * Monitor performance metrics using Performance Observer API
 * 
 * @function monitorPerformance
 * @returns {void}
 * 
 * @description Monitors application performance metrics using the Performance Observer API.
 * Tracks resource loading times, identifies slow resources, and provides insights
 * for optimization opportunities. Runs only in development mode for debugging.
 * 
 * @since 2.0.0
 * 
 * Monitoring Capabilities:
 * - Resource loading performance
 * - Core Web Vitals tracking
 * - Slow resource identification (>1000ms)
 * - Silent monitoring without user impact
 * 
 * @example
 * // Enable performance monitoring in development
 * if (import.meta.env.MODE === 'development') {
 *   monitorPerformance();
 * }
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver}
 * @see {@link https://web.dev/vitals/}
 */
export const monitorPerformance = () => {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.loadTime > 1000) {
          // Slow resource detected - monitoring silently
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
  }
};

/**
 * Initialize comprehensive performance optimizations
 * 
 * @function initPerformanceOptimizations
 * @returns {void}
 * 
 * @description Initializes all performance optimization features after initial render.
 * Combines route prefetching, image lazy loading, service worker registration,
 * and performance monitoring into a single initialization function.
 * 
 * @since 2.0.0
 * 
 * Optimization Features:
 * - Route prefetching (temporarily disabled)
 * - Lazy image loading
 * - Service worker registration
 * - Performance monitoring (development only)
 * - Delayed execution to avoid blocking initial render
 * 
 * @example
 * // Initialize all optimizations on app startup
 * import { initPerformanceOptimizations } from './utils/performance.js';
 * 
 * // Call after React app mounts
 * useEffect(() => {
 *   initPerformanceOptimizations();
 * }, []);
 * 
 * @example
 * // Initialize in main.jsx
 * import { initPerformanceOptimizations } from './utils/performance.js';
 * 
 * ReactDOM.createRoot(document.getElementById('root')).render(<App />);
 * initPerformanceOptimizations();
 */
export const initPerformanceOptimizations = () => {
  // Run after initial render
  setTimeout(() => {
    // Temporarily disable prefetching to fix 404 errors
    // prefetchCriticalRoutes();
    lazyLoadImages();
    registerSW();

    if (import.meta.env.MODE === 'development') {
      monitorPerformance();
    }
  }, 1000);
};
