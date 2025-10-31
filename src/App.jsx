 
/**
 * @file App.jsx
 * @description The root component of the application.
 * @project Felony Fitness
 *
 * @workflow
 * This component sets up the main layout structure for the entire application.
 * It consists of:
 * 1. A `main-content` area where the content of the current page/route is rendered.
 * This is handled by the `<Outlet />` component from React Router.
 * 2. A persistent `bottom-nav` bar that is visible on all main pages of the app.
 * This navigation bar uses `<NavLink />` components to link to the different sections
 * and to visually indicate the user's current location with an "active" class.
 */

/**
 * App.jsx
 *
 * Application shell: routes, bottom navigation and high-level layout. Keep
 * this file minimal; route-level components implement their own behavior
 * and data fetching.
 */
import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, Dumbbell, Apple, TrendingUp, User, UserCog } from 'lucide-react';
import { useResponsive } from './hooks/useResponsive';
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

// Trainer dashboard only available on larger screens
const desktopNavItems = [
  ...baseNavItems.slice(0, 4), // Dashboard through Progress
  { to: "/trainer-dashboard", icon: UserCog, label: "Trainer" },
  baseNavItems[4] // Profile
];

/**
 * Sidebar Navigation Component (for desktop/tablet)
 */
const SidebarNav = ({ navItems }) => (
  <nav className="sidebar-nav">
    <div className="sidebar-header">
      <h2>Felony Fitness</h2>
    </div>
    <div className="sidebar-links">
      {navItems.map(({ to, icon: IconComponent, label }) => (
        <NavLink key={to} to={to} className="sidebar-link">
          <IconComponent size={20} />
          <span>{label}</span>
        </NavLink>
      ))}
    </div>
  </nav>
);

/**
 * Bottom Navigation Component (for mobile)
 */
const BottomNav = ({ navItems }) => (
  <nav className="bottom-nav">
    {navItems.map(({ to, icon: IconComponent, label }) => (
      <NavLink key={to} to={to} className="nav-link">
        <IconComponent />
        <span>{label}</span>
      </NavLink>
    ))}
  </nav>
);

/**
 * The main application layout component.
 * It renders the primary navigation and the content area for all child routes.
 * Uses responsive design to show sidebar on larger screens and bottom nav on mobile.
 * @returns {JSX.Element} The main app structure.
 */
function App() {
  const { isTabletOrLarger } = useResponsive();

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
