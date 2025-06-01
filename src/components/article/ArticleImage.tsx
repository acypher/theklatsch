import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ArticleImageProps {
  imageUrl: string;
  sourceUrl: string | null;
  title: string;
  getImageUrl: (url: string) => string;
}

const ArticleImage = ({ imageUrl, sourceUrl, title, getImageUrl }: ArticleImageProps) => {
  return (
    <AspectRatio ratio={16 / 9} className="overflow-hidden bg-muted/20">
      <img 
        src={getImageUrl(imageUrl)} 
        alt={title} 
        className="w-full h-full object-contain"
        loading="lazy"
      />
    </AspectRatio>
  );
};

export default ArticleImage;