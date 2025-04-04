
import React from "react";

interface ImageDisplayProps {
  imageUrl: string;
  title: string;
  sourceUrl?: string;
}

// Helper function to handle Google Drive links
const getImageUrl = (url: string) => {
  if (url.includes('drive.google.com/file/d/')) {
    const fileIdMatch = url.match(/\/d\/([^/]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      const fileId = fileIdMatch[1];
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
  }
  return url;
};

const ImageDisplay = ({ imageUrl, title, sourceUrl }: ImageDisplayProps) => {
  if (sourceUrl) {
    return (
      <a 
        href={sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-lg overflow-hidden"
        aria-label={`View original source for ${title}`}
      >
        <div className="relative h-[300px] md:h-[400px] lg:h-[500px]">
          <img 
            src={getImageUrl(imageUrl)} 
            alt={title} 
            className="w-full h-full object-contain"
          />
        </div>
      </a>
    );
  }

  return (
    <div className="relative rounded-lg overflow-hidden h-[300px] md:h-[400px] lg:h-[500px]">
      <img 
        src={getImageUrl(imageUrl)} 
        alt={title} 
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export { getImageUrl };
export default ImageDisplay;
