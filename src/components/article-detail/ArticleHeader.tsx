
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil } from "lucide-react";
import { Article } from "@/lib/types";
import KeywordBadge from "../KeywordBadge";
import DeleteArticleDialog from "./DeleteArticleDialog";

interface ArticleHeaderProps {
  article: Article;
  isAuthenticated: boolean;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  isDeleting: boolean;
  handleDelete: () => Promise<void>;
}

const ArticleHeader = ({
  article,
  isAuthenticated,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  isDeleting,
  handleDelete
}: ArticleHeaderProps) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
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
      
      <div className="flex justify-between items-start mb-4">
        <h1 className="text-3xl md:text-4xl font-bold">{article.title}</h1>
        
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
            
            <DeleteArticleDialog
              title={article.title}
              isOpen={isDeleteDialogOpen}
              isDeleting={isDeleting}
              onOpenChange={setIsDeleteDialogOpen}
              onDelete={handleDelete}
            />
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
    </div>
  );
};

export default ArticleHeader;
