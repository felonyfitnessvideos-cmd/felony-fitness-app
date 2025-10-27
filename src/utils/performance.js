/**
 * Performance optimization utilities
 * Client-side performance enhancements
 */

// Preload critical routes
const criticalRoutes = ['/dashboard', '/workouts', '/nutrition'];

// Prefetch critical routes after main app loads
export const prefetchCriticalRoutes = () => {
  if ('requestIdleCallback' in window) {
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

// Optimize images with Intersection Observer
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

// Service Worker registration optimization
export const registerSW = async () => {
  if ('serviceWorker' in navigator) {
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

// Resource timing monitoring
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

// Initialize performance optimizations
export const initPerformanceOptimizations = () => {
  // Run after initial render
  setTimeout(() => {
    prefetchCriticalRoutes();
    lazyLoadImages();
    registerSW();
    
    if (process.env.NODE_ENV === 'development') {
      monitorPerformance();
    }
  }, 1000);
};