/**
 * LazyRecharts.jsx
 * Lightweight helper that dynamically imports the `recharts` library and
 * exposes its exports to children via a render-prop. This reduces initial
 * bundle size by deferring the large chart library until it's actually needed.
 */
import React, { useState, useEffect } from 'react';
export default function LazyRecharts({ children, fallback = null }) {
  const [rechartsModule, setRechartsModule] = useState(null);

  useEffect(() => {
    let mounted = true;
    import('recharts')
      .then(mod => {
        if (mounted) setRechartsModule(mod);
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
