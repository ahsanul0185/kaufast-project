import { useState, useEffect } from 'react';

/**
 * Hook that checks if the current viewport matches a media query
 * @param query - CSS media query to check against
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    // Check on initial render
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    // Skip for SSR environments
    if (typeof window === 'undefined') return undefined;

    const mediaQueryList = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQueryList.matches);

    // Define the change handler
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add event listener
    mediaQueryList.addEventListener('change', handleChange);
    
    // Clean up
    return () => {
      mediaQueryList.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}

/**
 * Hook that checks if the current viewport is mobile
 * @returns boolean indicating if the viewport is mobile
 */
export function useMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}

/**
 * Hook that checks if the current viewport is a tablet
 * @returns boolean indicating if the viewport is a tablet
 */
export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
}

/**
 * Hook that checks if the current viewport is desktop
 * @returns boolean indicating if the viewport is desktop
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}

/**
 * Legacy alias for useMobile - use useMobile instead
 */
export function useIsMobile(): boolean {
  return useMobile();
}