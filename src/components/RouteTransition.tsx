import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Subtle screen transition: fade + tiny lift + micro-blur whenever the route changes.
 * Uses the location pathname as a React key so the wrapper remounts on navigation,
 * re-triggering the `animate-page-enter` keyframe defined in index.css.
 *
 * Honors `prefers-reduced-motion` (the keyframe is suppressed via media query).
 */
export function RouteTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  return (
    <div key={location.pathname} className="animate-page-enter">
      {children}
    </div>
  );
}

export default RouteTransition;
