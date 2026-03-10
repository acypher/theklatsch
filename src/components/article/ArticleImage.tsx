import { AspectRatio } from "@/components/ui/aspect-ratio";
import { DEFAULT_IMAGE_URL } from "@/utils/defaultImage";
import GifPlayer from "@/components/GifPlayer";

interface ArticleImageProps {
  imageUrl: string;
  sourceUrl: string | null;
  title: string;
  getImageUrl: (url: string) => string;
}

const ArticleImage = ({ imageUrl, sourceUrl, title, getImageUrl }: ArticleImageProps) => {
  const finalImageUrl = (!imageUrl || imageUrl.includes('images.unsplash.com') || imageUrl.trim() === '') 
    ? DEFAULT_IMAGE_URL 
    : imageUrl;
  
  const resolvedUrl = getImageUrl(finalImageUrl);
  const isGif = finalImageUrl.toLowerCase().endsWith('.gif');
  
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

export default ArticleImage;