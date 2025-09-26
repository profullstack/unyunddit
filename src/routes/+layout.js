// Global layout configuration for SSR-only mode
// This ensures all pages are server-side rendered with no client-side JavaScript

export const ssr = true;        // Enable server-side rendering
export const csr = false;       // Disable client-side rendering (no hydration)
export const prerender = false; // Disable prerendering (dynamic content)

// Optional: You can also set trailingSlash behavior
// export const trailingSlash = 'never';