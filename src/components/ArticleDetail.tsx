
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { getArticleById, deleteArticle } from "@/lib/data";
import { Article } from "@/lib/types";
import KeywordBadge from "./KeywordBadge";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      setIsDeleting(true);
      await deleteArticle(id);
      toast.success("Article deleted successfully");
      navigate("/");
    } catch (error) {
      toast.error("Failed to delete article");
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  // Markdown component renderer customization
  const customRenderers = {
    // Customize link rendering to use proper attributes and prevent dropdown issues
    a: ({ node, ...props }: any) => (
      <a 
        {...props} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-primary hover:underline"
        onClick={(e) => e.stopPropagation()}
      />
    ),
    // Ensure paragraphs don't interfere with other UI components
    p: ({ node, ...props }: any) => <p className="markdown-paragraph" {...props} />,
  };

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
              <h1 className="text-3xl md:text-4xl font-bold prose prose-headings">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={customRenderers}>
                  {article.title}
                </ReactMarkdown>
              </h1>
              
              {isAuthenticated && (
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/article/${article.id}/edit`)}
                  >
                    <Pencil size={16} className="mr-2" />
                    Edit
                  </Button>
                  
                  <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-destructive border-destructive hover:bg-destructive/10"
                      >
                        <Trash2 size={16} className="mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the article
                          "{article.title}" from the database.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
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
            {article.sourceUrl ? (
              <a 
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative h-[300px] md:h-[400px] lg:h-[500px] rounded-lg overflow-hidden block cursor-pointer hover:opacity-90 transition-opacity bg-muted/20"
                aria-label={`View original source for ${article.title}`}
              >
                <img 
                  src={getImageUrl(article.imageUrl)} 
                  alt={article.title} 
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all flex items-center justify-center">
                  <div className="p-3 rounded-full bg-white bg-opacity-0 hover:bg-opacity-70 transition-all"></div>
                </div>
              </a>
            ) : (
              <div className="relative h-[300px] md:h-[400px] lg:h-[500px] rounded-lg overflow-hidden bg-muted/20">
                <img 
                  src={getImageUrl(article.imageUrl)} 
                  alt={article.title} 
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>
          
          <div className="prose prose-lg max-w-none mb-8">
            <div className="markdown-wrapper text-xl leading-relaxed mb-8">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]} 
                components={customRenderers}
              >
                {article.description}
              </ReactMarkdown>
            </div>
            
            {article.more_content && (
              <div className="mt-8 pt-8 border-t">
                <h2 className="text-2xl font-bold mb-4">More Information</h2>
                <div className="prose prose-lg max-w-none markdown-wrapper">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]} 
                    components={customRenderers}
                  >
                    {article.more_content}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-12">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/")}
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to articles
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default ArticleDetail;
