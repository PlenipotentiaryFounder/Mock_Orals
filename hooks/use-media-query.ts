'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook for tracking the state of a CSS media query.
 * @param query The media query string to match (e.g., '(min-width: 768px)').
 * @returns `true` if the media query matches, `false` otherwise.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    // Ensure window is defined (for SSR compatibility)
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQueryList = window.matchMedia(query);
    
    // Function to update state based on match status
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Set initial state
    setMatches(mediaQueryList.matches);

    // Add listener for changes
    // Using addEventListener for modern browsers, with fallback for older ones
    try {
        mediaQueryList.addEventListener('change', listener);
    } catch (e) {
        // Fallback for older browsers
        mediaQueryList.addListener(listener);
    }

    // Cleanup function to remove listener on unmount
    return () => {
        try {
            mediaQueryList.removeEventListener('change', listener);
        } catch (e) {
            // Fallback for older browsers
            mediaQueryList.removeListener(listener);
        }
    };
  }, [query]); // Re-run effect if query changes

  return matches;
} 