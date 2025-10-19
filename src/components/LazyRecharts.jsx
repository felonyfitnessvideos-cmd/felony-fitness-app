import React, { useState, useEffect } from 'react';

// Dynamically import `recharts` and provide its exports to children via a
// render-prop. This keeps the heavy `recharts` code out of the initial bundle
// until a chart is actually rendered.
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
