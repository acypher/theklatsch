
interface ArticleImageProps {
  imageUrl: string;
  sourceUrl: string | null;
  title: string;
  getImageUrl: (url: string) => string;
}

const ArticleImage = ({ imageUrl, sourceUrl, title, getImageUrl }: ArticleImageProps) => {
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
            src={getImageUrl(imageUrl)} 
            alt={title} 
            className="w-full h-full object-contain"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all flex items-center justify-center">
            <div className="p-3 rounded-full bg-white bg-opacity-0 hover:bg-opacity-70 transition-all"></div>
          </div>
        </a>
      ) : (
        <div className="relative h-[300px] md:h-[400px] lg:h-[500px] rounded-lg overflow-hidden bg-muted/20">
          <img 
            src={getImageUrl(imageUrl)} 
            alt={title} 
            className="w-full h-full object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default ArticleImage;
