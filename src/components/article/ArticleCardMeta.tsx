
import { ExternalLink } from "lucide-react";

interface ArticleCardMetaProps {
  author: string;
  createdAt: string;
  sourceUrl: string;
  isGif: boolean;
  formatDate: (dateString: string) => string;
}

const ArticleCardMeta = ({ author, createdAt, sourceUrl, isGif, formatDate }: ArticleCardMetaProps) => {
  return (
    <>
      <p className="text-muted-foreground text-sm mb-2 hover:text-primary transition-colors cursor-pointer">
        By {author} • {formatDate(createdAt)}
      </p>
      <div className="mt-4 mb-3 flex justify-between items-center">
        {sourceUrl && !isGif && (
          <a 
            href={sourceUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 flex items-center gap-1 text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-4 w-4" />
            Go to the Source article
          </a>
        )}
        <div className="flex-grow"></div>
      </div>
    </>
  );
};

export default ArticleCardMeta;
