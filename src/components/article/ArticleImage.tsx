import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ArticleImageProps {
  imageUrl: string;
  sourceUrl: string | null;
  title: string;
  getImageUrl: (url: string) => string;
}

const ArticleImage = ({ imageUrl, sourceUrl, title, getImageUrl }: ArticleImageProps) => {
  const getImageUrlWithDefault = (url: string) => {
    // Use default image if no URL provided, if it's empty, null, or undefined
    if (!url || url.trim() === '' || url === 'null' || url === 'undefined' || url.length === 0) {
      return 'https://chatgpt.com/s/m_683bca1d9cc48191b1273258816b9fa8';
    }
    return getImageUrl(url);
  };

  return (
    <AspectRatio ratio={16 / 9} className="overflow-hidden bg-muted/20">
      <img 
        src={getImageUrlWithDefault(imageUrl)} 
        alt={title} 
        className="w-full h-full object-contain"
        loading="lazy"
      />
    </AspectRatio>
  );
};

export default ArticleImage;