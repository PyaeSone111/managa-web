/**
 * ThemeLoader – unified light theme, no API-driven theme switching.
 * Simply renders children with the static theme defined in index.css.
 */
export function ThemeLoader({ children }) {
  return children;
}

export default ThemeLoader;
