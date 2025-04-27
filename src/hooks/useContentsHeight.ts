
import { useState, useEffect } from 'react';

export const useContentsHeight = () => {
  const [maxHeight, setMaxHeight] = useState<number>(400);

  useEffect(() => {
    const calculateMaxHeight = () => {
      const viewportWidth = window.innerWidth;
      const maxAllowedHeight = 600;
      const minHeight = 250;
      
      if (viewportWidth >= 1200) {
        return maxAllowedHeight;
      }
      
      const calculatedHeight = Math.floor(viewportWidth / 2);
      return Math.min(Math.max(calculatedHeight, minHeight), maxAllowedHeight);
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
