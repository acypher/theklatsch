
import { useState, useEffect, useRef } from 'react';

export const useContentsHeight = () => {
  const [maxHeight, setMaxHeight] = useState<number>(400);
  
  useEffect(() => {
    const calculateMaxHeight = () => {
      // Try to find the first row of article cards
      const articleCards = document.querySelectorAll('.article-card');
      
      // Default fallback height if we can't find any article cards
      const baseHeight = 380;
      const minHeight = 300;
      
      // Initialize with the base height
      let tallestCardHeight = baseHeight;
      
      if (articleCards.length > 0) {
        // Get the top position of the first article card for reference
        const firstCardTop = articleCards[0]?.getBoundingClientRect().top;
        const sameRowCards = Array.from(articleCards).filter(card => {
          // Cards in the same row will have approximately the same top position
          // Allow a small tolerance of 10px
          const cardTop = card.getBoundingClientRect().top;
          return Math.abs(cardTop - firstCardTop) < 10;
        });
        
        // Find the tallest card in the first row
        if (sameRowCards.length > 0) {
          tallestCardHeight = Math.max(...sameRowCards.map(card => card.getBoundingClientRect().height));
          console.log("First row contains", sameRowCards.length, "cards. Tallest height:", tallestCardHeight);
        }
      } 
      
      // Add a small buffer (20px) to account for potential borders/margins
      return Math.max(tallestCardHeight + 20, minHeight);
    };
    
    // Small delay to ensure DOM is fully rendered before measuring
    const timer = setTimeout(() => {
      setMaxHeight(calculateMaxHeight());
    }, 300);
    
    const handleResize = () => {
      // Add debounce to avoid excessive calculations
      clearTimeout(timer);
      setTimeout(() => {
        setMaxHeight(calculateMaxHeight());
      }, 300);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return maxHeight;
};
