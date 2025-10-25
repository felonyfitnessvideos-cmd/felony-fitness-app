/**
 * @file LazyRecharts.jsx
 * @description
 * Small utility component that lazily loads the `recharts` library and
 * exposes it to children through a render-prop. This defers the large
 * charting bundle from initial app load and keeps the shell responsive.
 *
 * Usage contract
 * - children: function(module) => JSX where `module` is the imported
 *   `recharts` namespace (e.g., { LineChart, Line, ResponsiveContainer, ... }).
 * - fallback: optional React node rendered while the library is being loaded.
 *
 * Error handling
 * - If the dynamic import fails (network error or package missing), the
 *   component returns the `fallback` value. Consumers should handle a null
 *   module gracefully (i.e., render an informative empty state).
 *
 * Performance
 * - This component intentionally does not prefetch. If prefetching is
 *   desired, call `import('recharts')` earlier (e.g., when navigating to the
 *   page but before rendering the chart view).
 *
 * TODO (coderabbit): Consider a cache or shared loader if multiple chart
 * components are mounted concurrently to avoid duplicate dynamic imports.
 */
import React, { useState, useEffect } from 'react';

// Simple in-memory cache to avoid duplicate dynamic imports when multiple
// chart components mount simultaneously.
let cachedRecharts = null;

/**
 * Lazily loads the `recharts` library and renders children with the loaded module or a fallback while loading.
 *
 * @param {Object} props
 * @param {(module: Object) => import('react').ReactNode} props.children - Render-prop called with the `recharts` namespace (e.g., components like `LineChart`, `Line`, `ResponsiveContainer`) once the library is loaded.
 * @param {import('react').ReactNode} [props.fallback=null] - Node to render while `recharts` is loading or if loading fails.
 * @returns {import('react').ReactNode} The result of calling `children` with the loaded `recharts` module, or `fallback` if the module is not available.
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
  return children(rechartsModule);
}