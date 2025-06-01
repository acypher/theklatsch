import { Link } from "react-router-dom";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useEffect, useRef } from "react";
import { initGifController } from "@/utils/gifController";
import VideoViewer from "@/components/VideoViewer";
import { isVideoUrl } from "@/lib/search";

interface ArticleCardHeaderProps {
  articleId: string;
  imageUrl: string;
  title: string;
  isGif: boolean;
  getImageUrl: (url: string) => string;
}

const ArticleCardHeader = ({ articleId, imageUrl, title, isGif, getImageUrl }: ArticleCardHeaderProps) => {
  const gifControllerRef = useRef<{ dispose: () => void } | null>(null);
  const isVideo = isVideoUrl(imageUrl);

  useEffect(() => {
    // Only initialize GIF controller if it's actually a GIF and not a video
    if (isGif && !isVideo) {
      let isMounted = true;
      const timer = setTimeout(async () => {
        try {
          const controller = await initGifController();
          if (isMounted && controller) {
            gifControllerRef.current = controller;
          }
        } catch (error) {
          console.error("Error initializing GIF controller:", error);
        }
      }, 100);

      return () => {
        isMounted = false;
        clearTimeout(timer);
        if (gifControllerRef.current) {
          gifControllerRef.current.dispose();
        }
      };
    }
  }, [isGif, isVideo, imageUrl]);

  const handleImageClick = (e: React.MouseEvent) => {
    if (isGif && !isVideo) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <Link 
      to={`/article/${articleId}`}
      onClick={isGif && !isVideo ? handleImageClick : undefined}
    >
      <AspectRatio ratio={16 / 9} className="overflow-hidden bg-muted/20">
        {isVideo ? (
          <VideoViewer videoUrl={getImageUrl(imageUrl)} title={title} />
        ) : (
          <img 
            src={getImageUrl(imageUrl)} 
            alt={title} 
            className="w-full h-full object-contain"
            loading="lazy"
            id={isGif && !isVideo ? "animated-gif" : undefined}
          />
        )}
      </AspectRatio>
    </Link>
  );
};

export default ArticleCardHeader;