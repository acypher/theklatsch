import { AspectRatio } from "@/components/ui/aspect-ratio";
import { DEFAULT_IMAGE_URL } from "@/utils/defaultImage";

interface ArticleImageProps {
  imageUrl: string;
  sourceUrl: string | null;
  title: string;
  getImageUrl: (url: string) => string;
}

const ArticleImage = ({ imageUrl, sourceUrl, title, getImageUrl }: ArticleImageProps) => {
  // Use the default image from logos bucket if imageUrl is empty or contains unsplash
  const finalImageUrl = (!imageUrl || imageUrl.includes('images.unsplash.com') || imageUrl.trim() === '') 
    ? DEFAULT_IMAGE_URL 
    : imageUrl;
  
  return (
    <AspectRatio ratio={16 / 9} className="overflow-hidden bg-muted/20">
      <img 
        src={getImageUrl(finalImageUrl)} 
        alt={title} 
        className="w-full h-full object-contain"
        loading="lazy"
      />
    </AspectRatio>
  );
};

export default ArticleImage;