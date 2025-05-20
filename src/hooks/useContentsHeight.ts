
import { useState, useEffect } from 'react';

export const useContentsHeight = () => {
  const [maxHeight, setMaxHeight] = useState<number>(400);

  useEffect(() => {
    const calculateMaxHeight = () => {
      // Match the approximate height of article cards
      const baseHeight = 380; // Base height that works well across most layouts
      const viewportWidth = window.innerWidth;
      const minHeight = 250;
      
      if (viewportWidth >= 1200) {
        // For larger screens, use a slightly taller height
        return baseHeight;
      } else if (viewportWidth >= 768) {
        // For medium screens
        return Math.max(baseHeight - 20, minHeight);
      }
      
      // For smaller screens
      return Math.max(baseHeight - 40, minHeight);
    };
    
    setMaxHeight(calculateMaxHeight());
    
    const handleResize = () => {
      setMaxHeight(calculateMaxHeight());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return maxHeight;
};
