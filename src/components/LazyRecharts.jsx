/**
 * @fileoverview Lazy loading component for Recharts charting library
 * @description Small utility component that lazily loads the `recharts` library and
 * exposes it to children through a render-prop pattern. This defers the large
 * charting bundle from initial app load and keeps the shell responsive.
 * 
 * @author Felony Fitness Development Team
 * @version 1.0.0
 * @since 2025-11-02
 * 
 * @requires react
 * @requires recharts
 * 
 * @example
 * // Basic usage with render prop
 * <LazyRecharts fallback={<div>Loading charts...</div>}>
 *   {(recharts) => {
 *     const { LineChart, Line, ResponsiveContainer } = recharts;
 *     return (
 *       <ResponsiveContainer width="100%" height={300}>
 *         <LineChart data={data}>
 *           <Line dataKey="value" stroke="#8884d8" />
 *         </LineChart>
 *       </ResponsiveContainer>
 *     );
 *   }}
 * </LazyRecharts>
 * 
 * @example
 * // With error handling
 * <LazyRecharts fallback={<ChartSkeleton />}>
 *   {(recharts) => {
 *     if (!recharts) return <div>Failed to load charts</div>;
 *     return <YourChartComponent recharts={recharts} />;
 *   }}
 * </LazyRecharts>
 */
import { useState, useEffect } from 'react';

// Simple in-memory cache to avoid duplicate dynamic imports when multiple
// chart components mount simultaneously.
/** @type {Object|null} cachedRecharts - Cached recharts module to avoid duplicate imports */
let cachedRecharts = null;

/**
 * Lazy loading component for Recharts charting library
 * 
 * @function LazyRecharts
 * @param {Object} props - Component props
 * @param {Function} props.children - Render prop function that receives the recharts module
 * @param {React.ReactNode} [props.fallback=null] - Fallback UI shown while loading
 * @returns {React.ReactElement|null} Rendered component or fallback
 * 
 * @description Dynamically imports the recharts library and provides it to children
 * through a render prop pattern. Implements caching to avoid duplicate imports
 * and provides error handling for failed imports.
 * 
 * @performance
 * - Defers large recharts bundle loading until actually needed
 * - Caches module to prevent duplicate imports
 * - Uses cleanup patterns to prevent memory leaks
 * 
 * @example
 * // Render prop receives the full recharts module
 * <LazyRecharts>
 *   {(recharts) => {
 *     const { BarChart, Bar, XAxis, YAxis } = recharts;
 *     return <BarChart data={chartData}><Bar dataKey="value" /></BarChart>;
 *   }}
 * </LazyRecharts>
 */
export default function LazyRecharts({ children, fallback = null }) {
  const [rechartsModule, setRechartsModule] = useState(cachedRecharts);

  useEffect(() => {
    let mounted = true;
    if (cachedRecharts) {
      // Fast-path: already loaded
      setRechartsModule(cachedRecharts);
      return () => { mounted = false; };
    }

    import('recharts')
      .then(mod => {
        if (!mounted) return;
        cachedRecharts = mod;
        setRechartsModule(mod);
      })
      .catch(() => {
        if (mounted) setRechartsModule(null);
      });
    return () => { mounted = false; };
  }, []);

  if (!rechartsModule) return fallback;
  // children is expected to be a function that receives the recharts module
  if (typeof children !== 'function') return fallback;
  return children(rechartsModule);
}
