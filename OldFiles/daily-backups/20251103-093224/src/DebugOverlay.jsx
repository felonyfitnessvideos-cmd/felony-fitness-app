/**
 * @file DebugOverlay.jsx
 * @description Debug overlay to show responsive breakpoint info on screen
 * Only shows in development mode
 */

import React from 'react';
import { useResponsive } from '../hooks/useResponsive';

const DebugOverlay = () => {
  const { 
    width, 
    height, 
    deviceType, 
    isMobile, 
    isTablet, 
    isTabletOrLarger,
    breakpoints 
  } = useResponsive();

  // Temporarily show in production for tablet debugging
  // TODO: Remove this after tablet issue is resolved
  // if (!import.meta.env?.DEV) {
  //   return null;
  // }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      fontFamily: 'monospace',
      lineHeight: '1.3'
    }}>
      <div><strong>Debug Info:</strong></div>
      <div>Width: {width}px</div>
      <div>Height: {height}px</div>
      <div>Device: {deviceType}</div>
      <div>Mobile: {isMobile ? 'Yes' : 'No'}</div>
      <div>Tablet: {isTablet ? 'Yes' : 'No'}</div>
      <div>Tablet+: <span style={{color: isTabletOrLarger ? 'lime' : 'red'}}>{isTabletOrLarger ? 'Yes' : 'No'}</span></div>
      <div>Layout: <span style={{color: isTabletOrLarger ? 'lime' : 'red'}}>{isTabletOrLarger ? 'desktop-layout' : 'mobile-layout'}</span></div>
      <div>Breakpoint: 699px</div>
      <div>DPR: {window.devicePixelRatio}</div>
      <div style={{ fontSize: '10px', marginTop: '5px' }}>
        UA: {navigator.userAgent.substring(0, 30)}...
      </div>
    </div>
  );
};

export default DebugOverlay;