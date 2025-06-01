import { Link } from "react-router-dom";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ArticleCardHeaderProps {
  articleId: string;
  imageUrl: string;
  title: string;
  isGif: boolean;
  getImageUrl: (url: string) => string;
}

const ArticleCardHeader = ({ articleId, imageUrl, title, isGif, getImageUrl }: ArticleCardHeaderProps) => {
  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Link 
      to={`/article/${articleId}`}
      onClick={isGif ? handleImageClick : undefined}
    >
      <AspectRatio ratio={16 / 9} className="overflow-hidden bg-muted/20">
        <img 
          src={getImageUrl(imageUrl)} 
          alt={title} 
          className="w-full h-full object-contain"
          loading="lazy"
          id={isGif ? "animated-gif" : undefined}
        />
      </AspectRatio>
    </Link>
  );
};

export default ArticleCardHeader;