
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface ArticleCardHeaderProps {
  articleId: string;
  imageUrl: string[];
  title: string;
  isGif?: boolean;
  getImageUrl: (url: string) => string;
}

const ArticleCardHeader = ({ 
  articleId, 
  imageUrl, 
  title, 
  isGif, 
  getImageUrl 
}: ArticleCardHeaderProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Automatically cycle through images if there are multiple
  useEffect(() => {
    if (imageUrl.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((current) => (current + 1) % imageUrl.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [imageUrl]);
  
  // If there are no images, show a placeholder
  if (!imageUrl || imageUrl.length === 0) {
    return (
      <Link 
        to={`/article/${articleId}`}
        className="block relative aspect-[4/3] w-full border rounded-t-lg bg-muted/30 flex items-center justify-center"
      >
        <p className="text-muted-foreground">No image available</p>
      </Link>
    );
  }
  
  const currentImage = imageUrl[currentImageIndex];
  const hasMultipleImages = imageUrl.length > 1;
  
  return (
    <Link 
      to={`/article/${articleId}`}
      className="block relative aspect-[4/3] w-full overflow-hidden rounded-t-lg"
    >
      <img 
        src={getImageUrl(currentImage)} 
        alt={title}
        id={isGif ? "animated-gif" : undefined}
        className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
      />
      
      {isGif && (
        <Badge 
          variant="outline" 
          className="absolute top-2 right-2 bg-background/70 text-xs font-normal px-1.5 py-0.5"
        >
          GIF
        </Badge>
      )}
      
      {hasMultipleImages && (
        <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1 px-4">
          {imageUrl.map((_, index) => (
            <div 
              key={index}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                index === currentImageIndex ? 'bg-primary' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </Link>
  );
};

export default ArticleCardHeader;
