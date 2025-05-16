
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Article } from '@/lib/types';
import DraggableArticle from '@/components/article/DraggableArticle';
import { getAllArticles } from '@/lib/data';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader2, Search } from 'lucide-react';
import NoArticlesFound from '@/components/article/NoArticlesFound';
import LoadingState from '@/components/article/LoadingState';
import { updateSpecificArticle } from '@/lib/data/updateSpecificArticle';
import { Input } from './ui/input';
import { getCurrentIssue } from '@/lib/data';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';

const ArticleArrangeList = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentIssue, setCurrentIssue] = useState<string>('');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();
  
  // Initialize drag and drop functionality
  const { draggingItem, handleDragStart, handleDragOver, handleDragEnd, handleDrop } = useDragAndDrop({
    items: filteredArticles,
    onReorder: (reorderedItems) => {
      setFilteredArticles(reorderedItems);
      setUnsavedChanges(true);
    }
  });

  useEffect(() => {
    fetchArticles();
    
    const loadCurrentIssue = async () => {
      try {
        const data = await getCurrentIssue();
        if (data?.text) {
          setCurrentIssue(data.text);
        } else {
          setCurrentIssue("Unknown Issue");
        }
      } catch (error) {
        console.error("Error loading current issue:", error);
        setCurrentIssue("Unknown Issue");
      }
    };
    
    loadCurrentIssue();
  }, []);
  
  // Filter articles whenever search query changes
  useEffect(() => {
    filterArticles();
  }, [searchQuery, articles]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const fetchedArticles = await getAllArticles();
      // Sort by display_position
      const sortedArticles = [...fetchedArticles].sort((a, b) => {
        // If display positions are the same, sort by creation date
        if (a.displayPosition === b.displayPosition) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        // Otherwise, sort by display position
        return (a.displayPosition || 9999) - (b.displayPosition || 9999);
      });
      
      setArticles(sortedArticles);
      setFilteredArticles(sortedArticles);
    } catch (error) {
      console.error("Error fetching articles:", error);
      toast.error("Failed to load articles");
    } finally {
      setLoading(false);
    }
  };
  
  const filterArticles = () => {
    if (!searchQuery.trim()) {
      setFilteredArticles(articles);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = articles.filter(article => {
      return (
        article.title.toLowerCase().includes(query) ||
        article.description.toLowerCase().includes(query) ||
        article.author.toLowerCase().includes(query) ||
        article.keywords.some(kw => kw.toLowerCase().includes(query))
      );
    });
    
    setFilteredArticles(filtered);
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleSavePositions = async () => {
    setIsSaving(true);
    
    try {
      // Create save operations for all articles with new positions
      const savePromises = filteredArticles.map((article, index) => {
        return updateSpecificArticle(article.id, {
          display_position: index
        });
      });
      
      await Promise.all(savePromises);
      toast.success("Article positions saved successfully!");
      setUnsavedChanges(false);
      
      // Invalidate articles query to refresh any cached data
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    } catch (error) {
      console.error("Error saving positions:", error);
      toast.error("Failed to save article positions");
    } finally {
      setIsSaving(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const getFirstImage = (imageUrls: string[]): string => {
    if (Array.isArray(imageUrls) && imageUrls.length > 0) {
      return imageUrls[0];
    }
    return "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b";
  };

  if (loading) {
    return <LoadingState />;
  }

  if (filteredArticles.length === 0) {
    return (
      <div className="space-y-4">
        <div className="relative mb-6">
          <Input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        </div>
        
        <NoArticlesFound 
          searchQuery={searchQuery} 
          onClearSearch={() => setSearchQuery('')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">{currentIssue} - Arrange Articles</h2>
        <Button
          onClick={handleSavePositions}
          disabled={!unsavedChanges || isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Positions'
          )}
        </Button>
      </div>
      
      <div className="relative mb-6">
        <Input
          type="text"
          placeholder="Search articles..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        Drag and drop articles to reorder them. Changes won't be saved until you click "Save Positions".
      </p>
      
      <div className="space-y-2">
        {filteredArticles.map((article, index) => (
          <DraggableArticle
            key={article.id}
            article={article}
            index={index}
            draggingItem={draggingItem}
            getFirstImage={getFirstImage}
            formatDate={formatDate}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          />
        ))}
      </div>
    </div>
  );
};

export default ArticleArrangeList;
