/**
 * @fileoverview Advanced responsive design hook for real-time screen size detection
 * @description Comprehensive React hook providing responsive breakpoints, device type
 * detection, and screen dimension tracking with performance-optimized debouncing.
 * Handles Android Chrome viewport quirks and provides extensive utility functions.
 * 
 * @author Felony Fitness Development Team
 * @version 2.0.0
 * @since 2025-11-02
 * 
 * @requires React
 * 
 * Core Features:
 * - Real-time screen dimension tracking with automatic updates
 * - Device type categorization (mobile/tablet/desktop/wide)
 * - Performance-optimized resize handling with 150ms debouncing
 * - Android Chrome viewport compensation (89px UI element adjustment)
 * - Orientation detection (portrait/landscape)
 * - Custom breakpoint checking utilities
 * - Higher-order component wrapper for automatic responsive props
 */

import React, { useState, useEffect } from 'react';

/**
 * Responsive breakpoints adjusted for real-world Android Chrome viewport
 * Android tablets lose ~89px width due to browser UI elements
 */
const BREAKPOINTS = {
  mobile: 0,
  tablet: 604, // Set to 604px to ensure tablet devices can access sidebar features
  desktop: 1024,
  wide: 1440
};

/**
 * Device type categories based on screen width
 */
const DEVICE_TYPES = {
  MOBILE: 'mobile',
  TABLET: 'tablet', 
  DESKTOP: 'desktop',
  WIDE: 'wide'
};

/**
 * Screen size state interface
 */
interface ScreenSize {
  width: number;
  height: number;
}

/**
 * Return type for useResponsive hook
 */
interface UseResponsiveReturn {
  // Screen dimensions
  width: number;
  height: number;
  
  // Device type
  deviceType: string;
  
  // Breakpoint checks
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
  isTabletOrLarger: boolean;
  isDesktopOrLarger: boolean;
  
  // Orientation
  orientation: 'portrait' | 'landscape';
  
  // Utilities
  isBreakpoint: (min: number, max?: number) => boolean;
  
  // Constants for reference
  BREAKPOINTS: typeof BREAKPOINTS;
  DEVICE_TYPES: typeof DEVICE_TYPES;
}

/**
 * Custom hook for responsive design and screen size detection
 * 
 * Provides real-time screen dimensions, device type detection, and responsive
 * breakpoint utilities. Automatically updates when window is resized and
 * includes debouncing for performance optimization.
 * 
 * @returns {UseResponsiveReturn} Responsive state and utilities
 * 
 * @example
 * const { deviceType, isTabletOrLarger, width } = useResponsive();
 * 
 * // Conditional rendering based on device type
 * if (deviceType === 'mobile') {
 *   return <MobileLayout />;
 * }
 * 
 * // Show trainer features only on tablet or larger
 * {isTabletOrLarger && <TrainerButton />}
 * 
 * // Custom breakpoint checking
 * const isSmallTablet = isBreakpoint(768, 900);
 */
export const useResponsive = (): UseResponsiveReturn => {
  const [screenSize, setScreenSize] = useState<ScreenSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  /**
   * Determine device type based on screen width
   * 
   * @param {number} width - Screen width in pixels
   * @returns {string} Device type category
   */
  const getDeviceType = (width: number): string => {
    if (width >= BREAKPOINTS.wide) return DEVICE_TYPES.WIDE;
    if (width >= BREAKPOINTS.desktop) return DEVICE_TYPES.DESKTOP;
    if (width >= BREAKPOINTS.tablet) return DEVICE_TYPES.TABLET;
    return DEVICE_TYPES.MOBILE;
  };

  /**
   * Debounced resize handler to improve performance
   */
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const handleResize = (): void => {
      // Clear existing timeout to debounce
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Set new timeout for debounced update
      timeoutId = setTimeout(() => {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;
        
        // Screen resize detected - responsive update
        
        setScreenSize({
          width: newWidth,
          height: newHeight
        });
      }, 150); // 150ms debounce delay
    };

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const { width, height } = screenSize;
  const deviceType = getDeviceType(width);

  // Breakpoint checks
  const isMobile = width < BREAKPOINTS.tablet;
  const isTablet = width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop;
  const isDesktop = width >= BREAKPOINTS.desktop && width < BREAKPOINTS.wide;
  const isWide = width >= BREAKPOINTS.wide;
  
  // Utility breakpoints
  const isTabletOrLarger = width >= BREAKPOINTS.tablet;
  const isDesktopOrLarger = width >= BREAKPOINTS.desktop;

  // Orientation detection
  const orientation = height > width ? 'portrait' : 'landscape';

  /**
   * Custom breakpoint checker
   * 
   * @param {number} min - Minimum width (inclusive)
   * @param {number} max - Maximum width (exclusive) - optional
   * @returns {boolean} True if current width is within range
   */
  const isBreakpoint = (min: number, max: number = Infinity): boolean => {
    return width >= min && width < max;
  };

  return {
    // Screen dimensions
    width,
    height,
    
    // Device type
    deviceType,
    
    // Breakpoint checks
    isMobile,
    isTablet,
    isDesktop,
    isWide,
    isTabletOrLarger,
    isDesktopOrLarger,
    
    // Orientation
    orientation,
    
    // Utilities
    isBreakpoint,
    
    // Constants for reference
    BREAKPOINTS,
    DEVICE_TYPES
  };
};

/**
 * Higher-order component for responsive behavior
 * 
 * Wraps a component and provides responsive props automatically
 * 
 * @param {React.Component} WrappedComponent - Component to wrap
 * @returns {React.Component} Enhanced component with responsive props
 * 
 * @example
 * const ResponsiveHeader = withResponsive(Header);
 * // Header component will receive responsive props automatically
 */
export const withResponsive = (WrappedComponent: React.ComponentType<Record<string, unknown>>) => {
  return function ResponsiveComponent(props: Record<string, unknown>) {
    const responsive = useResponsive();
    return <WrappedComponent {...props} responsive={responsive} />;
  };
};

export default useResponsive;
