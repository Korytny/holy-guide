import { useState, useEffect } from 'react';

const useMobile = (query: string = '(max-width: 768px)') => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Ensure window is defined (for SSR/SSG)
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);
    
    // Set the initial state
    setMatches(mediaQuery.matches);
    
    // Add listener for changes
    mediaQuery.addEventListener('change', handler);
    
    // Clean up listener on unmount
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
};

export default useMobile;
