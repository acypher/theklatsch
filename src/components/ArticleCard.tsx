
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Article } from "@/lib/types";
import KeywordBadge from "./KeywordBadge";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ArticleCardProps {
  article: Article;
}

const ArticleCard = ({ article }: ArticleCardProps) => {
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="p-0">
        <Link to={`/article/${article.id}`}>
          <AspectRatio ratio={16 / 9} className="overflow-hidden">
            <img 
              src={article.imageUrl} 
              alt={article.title} 
              className="w-full h-full object-cover transition-transform hover:scale-105"
              loading="lazy"
            />
          </AspectRatio>
        </Link>
      </CardHeader>
      <CardContent className="flex-grow pt-6">
        <Link to={`/article/${article.id}`}>
          <h3 className="text-xl font-semibold line-clamp-2 hover:text-primary transition-colors mb-2">{article.title}</h3>
        </Link>
        <p className="text-muted-foreground text-sm mb-2">By {article.author} • {formatDate(article.createdAt)}</p>
        <p className="text-muted-foreground mb-4 line-clamp-3">{article.description}</p>
        <div className="flex flex-wrap gap-2">
          {article.keywords.map((keyword, index) => (
            <KeywordBadge key={index} keyword={keyword} />
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Link 
          to={`/article/${article.id}`}
          className="text-primary hover:text-primary/80 font-medium text-sm"
        >
          Read more →
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ArticleCard;
