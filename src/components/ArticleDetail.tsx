
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ExternalLink, ArrowLeft, Pencil } from "lucide-react";
import { getArticleById } from "@/lib/data";
import { Article } from "@/lib/types";
import KeywordBadge from "./KeywordBadge";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchArticle = async () => {
      if (id) {
        try {
          setLoading(true);
          const fetchedArticle = await getArticleById(id);
          if (fetchedArticle) {
            setArticle(fetchedArticle);
          } else {
            toast.error("Article not found");
            navigate("/");
          }
        } catch (error) {
          toast.error("Failed to load article");
          navigate("/");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchArticle();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-secondary rounded w-3/4"></div>
          <div className="h-4 bg-secondary rounded w-1/4"></div>
          <div className="h-64 bg-secondary rounded"></div>
          <div className="space-y-2">
            <div className="h-4 bg-secondary rounded"></div>
            <div className="h-4 bg-secondary rounded"></div>
            <div className="h-4 bg-secondary rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Article not found</h2>
        <Button asChild>
          <Link to="/">Return to Home</Link>
        </Button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-6" 
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to articles
        </Button>
        
        {article && (
          <>
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl md:text-4xl font-bold">{article.title}</h1>
              
              {isAuthenticated && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/article/${article.id}/edit`)}
                  className="ml-4"
                >
                  <Pencil size={16} className="mr-2" />
                  Edit
                </Button>
              )}
            </div>
            
            <div className="flex flex-wrap items-center text-muted-foreground mb-6">
              <span className="font-medium text-foreground">{article.author}</span>
              <span className="mx-2">•</span>
              <span>{formatDate(article.createdAt)}</span>
            </div>
            
            <div className="mb-6 flex flex-wrap gap-2">
              {article.keywords.map((keyword, index) => (
                <KeywordBadge 
                  key={index} 
                  keyword={keyword} 
                  onClick={() => navigate(`/?keyword=${encodeURIComponent(keyword)}`)} 
                />
              ))}
            </div>
          </>
        )}
      </div>
      
      {article && (
        <>
          <div className="mb-8">
            <div className="relative h-[300px] md:h-[400px] lg:h-[500px] rounded-lg overflow-hidden">
              <img 
                src={article.imageUrl} 
                alt={article.title} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          <div className="prose prose-lg max-w-none mb-8">
            <p className="text-xl leading-relaxed mb-8">{article.description}</p>
            
            {article.sourceUrl && (
              <div className="mt-12 pt-6 border-t">
                <Button asChild variant="outline">
                  <a 
                    href={article.sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink size={16} />
                    View Original Source
                  </a>
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ArticleDetail;
