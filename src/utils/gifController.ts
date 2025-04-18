
export const initGifController = (playDuration: number = 10000) => {
  const gif = document.getElementById('animated-gif');
  if (!gif) return;

  // Get the URLs - we'll extract the base name from the GIF URL
  const gifUrl = (gif as HTMLImageElement).src;
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

  // Handle click event to toggle play/pause
  gif.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isPlaying) {
      stopGif();
    } else {
      startGif();
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
