
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface ArticleImageProps {
  imageUrl: string[];
  sourceUrl: string | null;
  title: string;
  getImageUrl: (url: string) => string;
}

const ArticleImage = ({ imageUrl, sourceUrl, title, getImageUrl }: ArticleImageProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // If there are no images, don't render anything
  if (!imageUrl || imageUrl.length === 0) {
    return null;
  }
  
  const currentImage = imageUrl[currentImageIndex];
  const hasMultipleImages = imageUrl.length > 1;
  
  // Only apply GIF controls if the image is a GIF
  const isGif = currentImage.toLowerCase().endsWith('.gif');
  
  const handleGifClick = (e: React.MouseEvent) => {
    if (isGif) {
      // For GIFs, we'll let the GIF controller handle the click
      e.preventDefault();
      e.stopPropagation();
    }
  };
  
  const goToPreviousImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? imageUrl.length - 1 : prevIndex - 1
    );
  };
  
  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === imageUrl.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  return (
    <div className="mb-8">
      {sourceUrl ? (
        <a 
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="relative h-[300px] md:h-[400px] lg:h-[500px] rounded-lg overflow-hidden block cursor-pointer hover:opacity-90 transition-opacity bg-muted/20"
          aria-label={`View original source for ${title}`}
        >
          <img 
            src={getImageUrl(currentImage)} 
            alt={`${title} - Image ${currentImageIndex + 1} of ${imageUrl.length}`} 
            className="w-full h-full object-contain"
            id={isGif ? "animated-gif" : undefined}
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all flex items-center justify-center">
            <div className="p-3 rounded-full bg-white bg-opacity-0 hover:bg-opacity-70 transition-all"></div>
          </div>
          
          {hasMultipleImages && (
            <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1 px-4">
              {imageUrl.map((_, index) => (
                <div 
                  key={index}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-primary' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </a>
      ) : (
        <div 
          className={`relative h-[300px] md:h-[400px] lg:h-[500px] rounded-lg overflow-hidden bg-muted/20 ${isGif ? 'cursor-pointer' : ''}`}
          onClick={handleGifClick}
        >
          <img 
            src={getImageUrl(currentImage)} 
            alt={`${title} - Image ${currentImageIndex + 1} of ${imageUrl.length}`} 
            className="w-full h-full object-contain"
            id={isGif ? "animated-gif" : undefined}
          />
          
          {hasMultipleImages && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-20 hover:bg-opacity-40 text-white rounded-full p-1"
                onClick={goToPreviousImage}
                aria-label="Previous image"
              >
                <ChevronLeft size={24} />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-20 hover:bg-opacity-40 text-white rounded-full p-1"
                onClick={goToNextImage}
                aria-label="Next image"
              >
                <ChevronRight size={24} />
              </Button>
              
              <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1 px-4">
                {imageUrl.map((_, index) => (
                  <div 
                    key={index}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
          
          {isGif && (
            <div className="absolute bottom-2 right-2 bg-background/80 text-sm text-muted-foreground p-1 px-2 rounded">
              Click to play/pause
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ArticleImage;
