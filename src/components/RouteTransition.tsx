import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Subtle screen transition: fade + tiny lift + micro-blur whenever the route changes.
 * Wrap the entire `<Routes>` tree with this component — it re-keys on `pathname`,
 * which remounts the wrapper and re-fires the `animate-page-enter` keyframe defined
 * in `index.css`.
 *
 * Honors `prefers-reduced-motion` (the keyframe is suppressed via media query).
 */
export function RouteTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  return (
    <div key={location.pathname} className="animate-page-enter min-h-screen">
      {children}
    </div>
  );
}

export default RouteTransition;
