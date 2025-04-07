import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Article } from "@/lib/types";
import KeywordBadge from "./KeywordBadge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ArticleCardProps {
  article: Article;
}

const ArticleCard = ({ article }: ArticleCardProps) => {
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getImageUrl = (url: string) => {
    // Check if it's a Google Drive URL
    if (url.includes('drive.google.com/file/d/')) {
      // Extract the file ID from the URL
      const fileIdMatch = url.match(/\/d\/([^/]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        const fileId = fileIdMatch[1];
        // Return the direct image URL format for Google Drive
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
      }
    }
    // Return the original URL for non-Google Drive images
    return url;
  };

  // Custom renderers for ReactMarkdown to handle links properly
  const customRenderers = {
    // Customize link rendering to use proper attributes and prevent dropdown issues
    a: ({ node, ...props }: any) => (
      <a 
        {...props} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-primary hover:underline"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          window.open(props.href, '_blank', 'noopener,noreferrer');
        }}
      />
    ),
    // Keep paragraphs contained
    p: ({ node, ...props }: any) => <p className="markdown-paragraph" {...props} />,
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="p-0">
        <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer">
          <AspectRatio ratio={16 / 9} className="overflow-hidden">
            <img 
              src={getImageUrl(article.imageUrl)} 
              alt={article.title} 
              className="w-full h-full object-cover transition-transform hover:scale-105"
              loading="lazy"
            />
          </AspectRatio>
        </a>
      </CardHeader>
      <CardContent className="flex-grow pt-6">
        <Link to={`/article/${article.id}`}>
          <h3 className="text-xl font-semibold line-clamp-2 hover:text-primary transition-colors mb-2">{article.title}</h3>
        </Link>
        <p className="text-muted-foreground text-sm mb-2">By {article.author} • {formatDate(article.createdAt)}</p>
        <div className="text-muted-foreground mb-4 line-clamp-3 prose prose-sm max-w-none markdown-wrapper">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={customRenderers}
          >
            {article.description}
          </ReactMarkdown>
        </div>
        <div className="flex flex-wrap gap-2">
          {article.keywords.map((keyword, index) => (
            <KeywordBadge key={index} keyword={keyword} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ArticleCard;
