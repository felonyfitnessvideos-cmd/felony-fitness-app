/**
 * @fileoverview Main application shell component with routing and navigation
 * @description Root application component providing layout structure, routing
 * configuration, and persistent navigation. Serves as the foundation for all
 * authenticated user interactions with optimized layout and accessibility.
 * 
 * @author Felony Fitness Development Team
 * @version 2.0.0
 * @since 2025-11-02
 * 
 * @requires React
 * @requires react-router-dom
 * @requires lucide-react
 * @requires useResponsive
 * @requires performance
 * 
 * Application Architecture:
 * - **Layout Structure**: Main content area with persistent bottom navigation
 * - **Route Management**: Protected route configuration for authenticated users
 * - **Navigation**: Icon-based bottom navigation with active state indicators
 * - **Performance**: Lazy loading and code splitting for optimal bundle size
 * - **Accessibility**: Semantic navigation with ARIA labels and focus management
 * 
 * Layout Components:
 * 1. **Main Content Area**: Dynamic route content via React Router Outlet
 * 2. **Bottom Navigation**: Persistent navigation bar across all main pages
 * 3. **Performance Optimization**: Automatic initialization of performance features
 * 
 * @example
 * // App structure rendered by this component
 * <div className="app">
 *   <main className="main-content">
 *     <Outlet /> // Route-specific content
 *   </main>
 *   <nav className="bottom-nav">
 *     // Navigation links with active states
 *   </nav>
 * </div>
 */
import React, { useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, Dumbbell, Apple, TrendingUp, User, UserCog } from 'lucide-react';
import { useResponsive } from './hooks/useResponsive';
import { initPerformanceOptimizations } from './utils/performance.js';
import './App.css';

/**
 * Navigation items configuration
 */
const baseNavItems = [
  { to: "/dashboard", icon: Home, label: "Dashboard" },
  { to: "/workouts", icon: Dumbbell, label: "Workouts" },
  { to: "/nutrition", icon: Apple, label: "Nutrition" },
  { to: "/progress", icon: TrendingUp, label: "Progress" },
  { to: "/profile", icon: User, label: "Profile" }
];

// Advanced tools dashboard only available on larger screens
const desktopNavItems = [
  ...baseNavItems.slice(0, 4), // Dashboard through Progress
  { to: "/trainer-dashboard", icon: UserCog, label: "Pro Tools" },
  baseNavItems[4] // Profile
];

/**
 * Sidebar Navigation Component (for desktop/tablet)
 */
const SidebarNav = ({ navItems }) => {
  const getSidebarLinkClass = ({ isActive }, to) => {
    // Highlight workout icon for both /workouts and /mesocycles routes
    if (to === '/workouts') {
      const currentPath = window.location.pathname;
      const isWorkoutSection = currentPath.startsWith('/workouts') || currentPath.startsWith('/mesocycles');
      return isWorkoutSection ? 'sidebar-link active' : 'sidebar-link';
    }
    return isActive ? 'sidebar-link active' : 'sidebar-link';
  };

  return (
    <nav className="sidebar-nav">
      <div className="sidebar-header">
        <h2>Felony Fitness</h2>
      </div>
      <div className="sidebar-links">
        {navItems.map(({ to, icon: IconComponent, label }) => (
          <NavLink key={to} to={to} className={(props) => getSidebarLinkClass(props, to)}>
            <IconComponent size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

/**
 * Bottom Navigation Component (for mobile)
 */
const BottomNav = ({ navItems }) => {
  const getNavLinkClass = ({ isActive }, to) => {
    // Highlight workout icon for both /workouts and /mesocycles routes
    if (to === '/workouts') {
      const currentPath = window.location.pathname;
      const isWorkoutSection = currentPath.startsWith('/workouts') || currentPath.startsWith('/mesocycles');
      return isWorkoutSection ? 'nav-link active' : 'nav-link';
    }
    return isActive ? 'nav-link active' : 'nav-link';
  };

  return (
    <nav className="bottom-nav">
      {navItems.map(({ to, icon: IconComponent, label }) => (
        <NavLink key={to} to={to} className={(props) => getNavLinkClass(props, to)}>
          <IconComponent />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
};



/**
 * The main application layout component.
 * It renders the primary navigation and the content area for all child routes.
 * Uses responsive design to show sidebar on larger screens and bottom nav on mobile.
 * @returns {JSX.Element} The main app structure.
 */
function App() {
  const responsive = useResponsive();
  const { isTabletOrLarger } = responsive;

  // Initialize performance optimizations after app mounts
  useEffect(() => {
    initPerformanceOptimizations();
  }, []);

  return (
    <div className={`app-container ${isTabletOrLarger ? 'desktop-layout' : 'mobile-layout'}`}>
      {/* Sidebar navigation for tablet and desktop */}
      {isTabletOrLarger && <SidebarNav navItems={desktopNavItems} />}
      
      <main className="main-content">
        {/* The Outlet component renders the matched child route's component. */}
        <Outlet />
      </main>
      
      {/* Bottom navigation for mobile */}
      {!isTabletOrLarger && <BottomNav navItems={baseNavItems} />}
    </div>
  );
}

export default App;
