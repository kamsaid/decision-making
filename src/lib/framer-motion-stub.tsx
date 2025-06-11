/**
 * Minimal stub for `framer-motion` used in environments where the real
 * dependency is not installed (CI or server-side builds).  It provides the
 * handful of exports the codebase relies on so that the application can build
 * without pulling in the full animation library.
 */

import React from 'react'

export const AnimatePresence: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => <>{children}</>

/**
 * A naïve proxy that returns a plain React component for any HTML element via
 * `motion.<tag>`.  At runtime these components simply render the underlying
 * DOM node and forward all received props, ignoring animation-specific ones.
 */
export const motion: Record<string, React.ComponentType<any>> = new Proxy(
  {},
  {
    get: (_, key: string) =>
      // eslint-disable-next-line react/display-name
      React.forwardRef(({ children, ...rest }: any, ref) =>
        React.createElement(key, { ...rest, ref }, children),
      ),
  },
)

// The real library exports `m`, an alias for `motion`.
// Providing it avoids potential undefined errors.
export const m = motion

// Default export parity with framer-motion’s module design.
export default { motion, AnimatePresence, m }
