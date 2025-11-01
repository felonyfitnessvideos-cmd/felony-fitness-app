/**
 * @file useResponsive.js
 * @description Custom hook for responsive design and screen size detection
 * @project Felony Fitness
 * 
 * This hook provides real-time screen size detection and responsive breakpoints
 * to help components adapt their layout and functionality based on device type.
 */

import React, { useState, useEffect } from 'react';

/**
 * Responsive breakpoints following common device standards
 */
const BREAKPOINTS = {
  mobile: 0,
  tablet: 720,
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
 * Custom hook for responsive design and screen size detection
 * 
 * Provides real-time screen dimensions, device type detection, and responsive
 * breakpoint utilities. Automatically updates when window is resized and
 * includes debouncing for performance optimization.
 * 
 * @returns {Object} Responsive state and utilities
 * @returns {number} returns.width - Current window width in pixels
 * @returns {number} returns.height - Current window height in pixels
 * @returns {string} returns.deviceType - Current device type (mobile/tablet/desktop/wide)
 * @returns {boolean} returns.isMobile - True if screen width < 768px
 * @returns {boolean} returns.isTablet - True if screen width >= 768px and < 1024px
 * @returns {boolean} returns.isDesktop - True if screen width >= 1024px and < 1440px
 * @returns {boolean} returns.isWide - True if screen width >= 1440px
 * @returns {boolean} returns.isTabletOrLarger - True if screen width >= 768px
 * @returns {boolean} returns.isDesktopOrLarger - True if screen width >= 1024px
 * @returns {string} returns.orientation - 'portrait' or 'landscape'
 * @returns {Function} returns.isBreakpoint - Function to check custom breakpoints
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
export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  /**
   * Determine device type based on screen width
   * 
   * @param {number} width - Screen width in pixels
   * @returns {string} Device type category
   */
  const getDeviceType = (width) => {
    if (width >= BREAKPOINTS.wide) return DEVICE_TYPES.WIDE;
    if (width >= BREAKPOINTS.desktop) return DEVICE_TYPES.DESKTOP;
    if (width >= BREAKPOINTS.tablet) return DEVICE_TYPES.TABLET;
    return DEVICE_TYPES.MOBILE;
  };

  /**
   * Debounced resize handler to improve performance
   */
  useEffect(() => {
    let timeoutId = null;

    const handleResize = () => {
      // Clear existing timeout to debounce
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Set new timeout for debounced update
      timeoutId = setTimeout(() => {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;
        
        // Debug logging for tablet detection issues
        if (import.meta.env?.DEV) {
          console.log('Screen resize detected:', {
            width: newWidth,
            height: newHeight,
            userAgent: navigator.userAgent,
            devicePixelRatio: window.devicePixelRatio
          });
        }
        
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

  // Debug logging for tablet detection
  if (import.meta.env?.DEV && width > 700 && width < 900) {
    console.log('Tablet detection debug:', {
      width,
      height,
      isMobile,
      isTablet,
      isTabletOrLarger,
      breakpointTablet: BREAKPOINTS.tablet,
      userAgent: navigator.userAgent.substring(0, 50) + '...'
    });
  }
  
  // Orientation detection
  const orientation = height > width ? 'portrait' : 'landscape';

  /**
   * Custom breakpoint checker
   * 
   * @param {number} min - Minimum width (inclusive)
   * @param {number} max - Maximum width (exclusive) - optional
   * @returns {boolean} True if current width is within range
   */
  const isBreakpoint = (min, max = Infinity) => {
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
 * @param {React.Component} Component - Component to wrap
 * @returns {React.Component} Enhanced component with responsive props
 * 
 * @example
 * const ResponsiveHeader = withResponsive(Header);
 * // Header component will receive responsive props automatically
 */
export const withResponsive = (_WrappedComponent) => {
  return function ResponsiveComponent(props) {
    const responsive = useResponsive();
    return <_WrappedComponent {...props} responsive={responsive} />;
  };
};

export default useResponsive;
