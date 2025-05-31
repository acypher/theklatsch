import { useState } from "react";
import { Play, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";

interface VideoViewerProps {
  url: string;
  title?: string;
  showPreview?: boolean;
  className?: string;
}

const VideoViewer = ({ url, title, showPreview = true, className }: VideoViewerProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showIframe, setShowIframe] = useState(false);

  // Extract video ID and determine platform
  const getVideoInfo = (url: string) => {
    // YouTube patterns
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    
    if (youtubeMatch) {
      return {
        platform: 'youtube',
        id: youtubeMatch[1],
        embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
        thumbnailUrl: `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`
      };
    }

    // Vimeo patterns
    const vimeoRegex = /(?:vimeo\.com\/)([0-9]+)/;
    const vimeoMatch = url.match(vimeoRegex);
    
    if (vimeoMatch) {
      return {
        platform: 'vimeo',
        id: vimeoMatch[1],
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
        thumbnailUrl: `https://vumbnail.com/${vimeoMatch[1]}.jpg`
      };
    }

    // Generic video files
    if (url.match(/\.(mp4|webm|ogg)$/i)) {
      return {
        platform: 'video',
        id: '',
        embedUrl: url,
        thumbnailUrl: null
      };
    }

    return null;
  };

  const videoInfo = getVideoInfo(url);

  if (!videoInfo) {
    return (
      <div className={`text-sm text-muted-foreground ${className}`}>
        <ExternalLink className="inline h-4 w-4 mr-1" />
        <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline">
          {title || "View Video"}
        </a>
      </div>
    );
  }

  const handlePlayClick = () => {
    setIsModalOpen(true);
    setShowIframe(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setShowIframe(false);
  };

  return (
    <>
      {showPreview ? (
        <Card className={`overflow-hidden cursor-pointer hover:shadow-lg transition-shadow ${className}`}>
          <div className="relative" onClick={handlePlayClick}>
            {videoInfo.thumbnailUrl ? (
              <div className="relative w-full h-48 bg-gray-100">
                <img 
                  src={videoInfo.thumbnailUrl} 
                  alt={title || "Video thumbnail"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden absolute inset-0 flex items-center justify-center bg-gray-200">
                  <Play className="h-12 w-12 text-gray-400" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-40 transition-all">
                  <div className="bg-white bg-opacity-90 rounded-full p-3">
                    <Play className="h-8 w-8 text-gray-800 fill-gray-800" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                <Play className="h-12 w-12 text-gray-400" />
              </div>
            )}
            {title && (
              <div className="p-3">
                <h4 className="font-medium text-sm line-clamp-2">{title}</h4>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handlePlayClick}
          className={className}
        >
          <Play className="h-4 w-4 mr-2" />
          Play Video
        </Button>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              {title || "Video Player"}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleCloseModal}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full">
            {showIframe && (
              videoInfo.platform === 'video' ? (
                <video 
                  src={videoInfo.embedUrl} 
                  controls 
                  className="w-full h-full"
                  autoPlay
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <iframe
                  src={videoInfo.embedUrl}
                  className="w-full h-full rounded"
                  frameBorder="0"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VideoViewer;