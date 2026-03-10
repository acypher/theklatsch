import { AspectRatio } from "@/components/ui/aspect-ratio";
import GifPlayer from "@/components/GifPlayer";

interface ArticleCardHeaderProps {
  articleId: string;
  imageUrl: string;
  title: string;
  isGif: boolean;
  getImageUrl: (url: string) => string;
}

const ArticleCardHeader = ({ articleId, imageUrl, title, isGif, getImageUrl }: ArticleCardHeaderProps) => {
  const resolvedUrl = getImageUrl(imageUrl);

  return (
    <AspectRatio ratio={16 / 9} className="overflow-hidden bg-muted/20">
      {isGif ? (
        <GifPlayer
          src={resolvedUrl}
          alt={title}
          className="w-full h-full object-contain"
        />
      ) : (
        <img 
          src={resolvedUrl} 
          alt={title} 
          className="w-full h-full object-contain"
          loading="lazy"
        />
      )}
    </AspectRatio>
  );
};

export default ArticleCardHeader;