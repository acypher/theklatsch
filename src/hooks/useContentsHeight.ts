
import { useState, useEffect } from 'react';

export interface ContentsHeights {
  cardHeight: number;
  tocHeight: number;
}

const DEFAULT_CARD_HEIGHT = 380;
const MIN_CARD_HEIGHT = 300;
const TOC_BUFFER = 20;

/** List article cards may grow to 1.5× the height of a standard card. */
export const LIST_CARD_HEIGHT_MULTIPLIER = 1.5;
export const LIST_CARD_MAX_HEIGHT_FALLBACK = Math.round(452 * LIST_CARD_HEIGHT_MULTIPLIER);

export const getListCardMaxHeight = (standardCardHeight: number): number =>
  Math.round(standardCardHeight * LIST_CARD_HEIGHT_MULTIPLIER);

export const useContentsHeight = (articleCount = 0): ContentsHeights => {
  const [heights, setHeights] = useState<ContentsHeights>({
    cardHeight: DEFAULT_CARD_HEIGHT,
    tocHeight: DEFAULT_CARD_HEIGHT + TOC_BUFFER,
  });
  
  useEffect(() => {
    const calculateHeights = (): ContentsHeights => {
      const articleCards = document.querySelectorAll('.article-card:not(.list-article-card)');
      
      let tallestCardHeight = DEFAULT_CARD_HEIGHT;
      
      if (articleCards.length > 0) {
        const firstCardTop = articleCards[0]?.getBoundingClientRect().top;
        const sameRowCards = Array.from(articleCards).filter(card => {
          const cardTop = card.getBoundingClientRect().top;
          return Math.abs(cardTop - firstCardTop) < 10;
        });
        
        if (sameRowCards.length > 0) {
          tallestCardHeight = Math.max(...sameRowCards.map(card => card.getBoundingClientRect().height));
        }
      }
      
      const cardHeight = Math.max(tallestCardHeight, MIN_CARD_HEIGHT);
      return { cardHeight, tocHeight: cardHeight + TOC_BUFFER };
    };
    
    const timer = setTimeout(() => {
      setHeights(calculateHeights());
    }, 300);
    
    const handleResize = () => {
      clearTimeout(timer);
      setTimeout(() => {
        setHeights(calculateHeights());
      }, 300);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [articleCount]);

  return heights;
};
