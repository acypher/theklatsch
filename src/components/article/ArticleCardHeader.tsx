import ArticleVideo from "./ArticleVideo";
import { isArticleVideo } from "@/lib/articleMedia";
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
      {isArticleVideo(resolvedUrl) ? (
        <ArticleVideo src={resolvedUrl} title={title} />
      ) : isGif ? (
        <GifPlayer
          src={resolvedUrl}
          alt={title}
          playDuration={5000}
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