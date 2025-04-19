
const isAnimatedGif = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    // GIF header is 6 bytes
    // After that, we have the Logical Screen Descriptor (7 bytes)
    // If there's more data after that, it's likely animated
    return buffer.byteLength > 13;
  } catch (error) {
    console.error("Error checking if GIF is animated:", error);
    return false;
  }
};

export const initGifController = async (playDuration: number = 10000) => {
  const gif = document.getElementById('animated-gif');
  if (!gif) return null;

  // Get the URLs - we'll extract the base name from the GIF URL
  const gifUrl = (gif as HTMLImageElement).src;
  
  // Check if this is actually an animated GIF
  const isAnimated = await isAnimatedGif(gifUrl);
  if (!isAnimated) return null;
  
  const staticUrl = gifUrl.replace('.gif', '.png');
  
  let isPlaying = true;
  let stopTimeout: number;

  // Function to stop the GIF
  const stopGif = () => {
    if (isPlaying) {
      (gif as HTMLImageElement).src = staticUrl;
      isPlaying = false;
    }
  };

  // Play the GIF and set a timeout to stop it
  const startGif = () => {
    (gif as HTMLImageElement).src = gifUrl;
    isPlaying = true;
    clearTimeout(stopTimeout);
    stopTimeout = window.setTimeout(stopGif, playDuration);
  };

  let clickTimeout: number | null = null;
  let clickCount = 0;

  // Handle click event to toggle play/pause or navigate on double click
  gif.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    clickCount++;
    
    if (clickCount === 1) {
      clickTimeout = window.setTimeout(() => {
        // Single click - toggle play/pause
        if (isPlaying) {
          stopGif();
        } else {
          startGif();
        }
        clickCount = 0;
      }, 300);
    } else if (clickCount === 2) {
      clearTimeout(clickTimeout!);
      clickCount = 0;
      
      // Double click - navigate to article detail
      const articleCard = gif.closest('.article-card');
      if (articleCard) {
        const articleId = articleCard.getAttribute('data-article-id');
        if (articleId) {
          window.location.href = `/article/${articleId}`;
        }
      }
    }
  });

  // Restart GIF when it comes back into view
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !isPlaying) {
          startGif();
        }
      });
    },
    { threshold: 0.5 }
  );

  observer.observe(gif);
  startGif();
  
  return {
    startGif,
    stopGif,
    dispose: () => {
      observer.disconnect();
      gif.removeEventListener('click', stopGif);
      clearTimeout(stopTimeout);
    }
  };
};
