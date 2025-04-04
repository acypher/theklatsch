
import { Article, CurrentIssue } from './types';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Default example articles that will be used as fallback
const DEFAULT_ARTICLES: Article[] = [
  {
    id: "1",
    title: "The Future of Web Development",
    description: "Exploring the latest trends and technologies shaping the future of web development.",
    author: "Sarah Johnson",
    keywords: ["Web Development", "JavaScript", "Future Tech"],
    imageUrl: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
    sourceUrl: "https://example.com/web-dev-future",
    createdAt: "2023-06-15T10:30:00Z",
    month: 4,
    year: 2025
  },
  {
    id: "2",
    title: "Machine Learning Basics",
    description: "A beginner-friendly introduction to machine learning concepts and applications.",
    author: "Michael Chen",
    keywords: ["Machine Learning", "AI", "Data Science"],
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    sourceUrl: "https://example.com/ml-basics",
    createdAt: "2023-05-22T14:20:00Z",
    month: 4,
    year: 2025
  },
  {
    id: "3",
    title: "Sustainable Living Tips",
    description: "Practical tips for adopting a more environmentally friendly lifestyle.",
    author: "Emma Wilson",
    keywords: ["Sustainability", "Environment", "Lifestyle"],
    imageUrl: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    sourceUrl: "https://example.com/sustainable-living",
    createdAt: "2023-07-08T09:15:00Z"
  },
  {
    id: "4",
    title: "Financial Independence Guide",
    description: "Strategies and advice for achieving financial freedom and security.",
    author: "David Brown",
    keywords: ["Finance", "Investment", "Money Management"],
    imageUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
    sourceUrl: "https://example.com/financial-independence",
    createdAt: "2023-04-30T16:45:00Z"
  },
  {
    id: "5",
    title: "Digital Art Techniques",
    description: "Creative approaches and tools for digital artists of all skill levels.",
    author: "Lisa Park",
    keywords: ["Digital Art", "Creativity", "Design"],
    imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    sourceUrl: "https://example.com/digital-art",
    createdAt: "2023-07-01T11:00:00Z"
  }
];

// Function to handle API errors
const handleApiError = (error: unknown) => {
  console.error("API Error:", error);
  toast.error("Failed to connect to the articles database. Using default data.");
  return DEFAULT_ARTICLES;
};

// Function to map database fields to our Article type
const mapArticleFromDb = (dbArticle: any): Article => {
  return {
    id: dbArticle.id,
    title: dbArticle.title,
    description: dbArticle.description,
    author: dbArticle.author,
    keywords: dbArticle.keywords || [],
    imageUrl: dbArticle.imageurl,
    sourceUrl: dbArticle.sourceurl,
    createdAt: dbArticle.created_at,
    more_content: dbArticle.more_content,
    deleted: dbArticle.deleted,
    deletedAt: dbArticle.deleted_at,
    month: dbArticle.month,
    year: dbArticle.year
  };
};

// Function to get current issue settings
export const getCurrentIssue = async (): Promise<CurrentIssue> => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'current_issue')
      .single();
    
    if (error) {
      console.error("Error fetching current issue:", error);
      return { month: new Date().getMonth() + 1, year: new Date().getFullYear() };
    }
    
    return data.value as CurrentIssue;
  } catch (error) {
    console.error("Error fetching current issue:", error);
    return { month: new Date().getMonth() + 1, year: new Date().getFullYear() };
  }
};

// Function to update current issue settings
export const updateCurrentIssue = async (month: number, year: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('settings')
      .update({ value: { month, year } })
      .eq('key', 'current_issue');
    
    if (error) {
      throw new Error(error.message);
    }
    
    return true;
  } catch (error) {
    console.error("Error updating current issue:", error);
    return false;
  }
};

// Function to fetch all articles for a specific month and year
export const getArticlesByIssue = async (month: number, year: number): Promise<Article[]> => {
  try {
    const { data: articles, error } = await supabase
      .from('articles')
      .select('*')
      .eq('deleted', false)
      .eq('month', month)
      .eq('year', year)
      .order('display_position', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    if (articles && articles.length > 0) {
      return articles.map(mapArticleFromDb);
    } else {
      console.log(`No articles found for issue ${month}/${year}, using default articles`);
      return DEFAULT_ARTICLES.filter(article => article.month === month && article.year === year);
    }
  } catch (error) {
    return handleApiError(error);
  }
};

// Function to fetch all articles from Supabase
export const getAllArticles = async (): Promise<Article[]> => {
  try {
    // First get the current issue
    const currentIssue = await getCurrentIssue();
    
    // Then get articles for that issue
    return await getArticlesByIssue(currentIssue.month, currentIssue.year);
  } catch (error) {
    return handleApiError(error);
  }
};

// Function to get article by ID
export const getArticleById = async (id: string): Promise<Article | undefined> => {
  try {
    const { data: article, error } = await supabase
      .from('articles' as any)
      .select('*')
      .eq('id', id)
      .eq('deleted', false)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapArticleFromDb(article);
  } catch (error) {
    console.error(`Error fetching article ${id}:`, error);
    return DEFAULT_ARTICLES.find(article => article.id === id);
  }
};

// Function to add a new article to Supabase
export const addArticle = async (article: Omit<Article, 'id' | 'createdAt'>): Promise<Article> => {
  try {
    // Get current issue settings for new article
    const currentIssue = await getCurrentIssue();
    
    const newArticle = {
      title: article.title,
      description: article.description,
      author: article.author,
      keywords: article.keywords,
      imageurl: article.imageUrl,
      sourceurl: article.sourceUrl,
      more_content: article.more_content,
      user_id: (await supabase.auth.getUser()).data.user?.id,
      month: currentIssue.month,
      year: currentIssue.year
    };
    
    const { data, error } = await (supabase
      .from('articles')
      .insert(newArticle)
      .select()
      .single());

    if (error) {
      throw new Error(error.message);
    }

    return mapArticleFromDb(data);
  } catch (error) {
    console.error("Error adding article:", error);
    throw new Error("Failed to add article to the database");
  }
};

// Function to update an existing article in Supabase
export const updateArticle = async (id: string, article: Omit<Article, 'id' | 'createdAt'>): Promise<Article> => {
  try {
    const updatedArticle = {
      title: article.title,
      description: article.description,
      author: article.author,
      keywords: article.keywords,
      imageurl: article.imageUrl,
      sourceurl: article.sourceUrl,
      more_content: article.more_content
    };
    
    const { data, error } = await (supabase
      .from('articles' as any)
      .update(updatedArticle as any)
      .eq('id', id)
      .select()
      .single());

    if (error) {
      throw new Error(error.message);
    }

    return mapArticleFromDb(data);
  } catch (error) {
    console.error("Error updating article:", error);
    throw new Error("Failed to update article in the database");
  }
};

// Function to get articles by keyword
export const getArticlesByKeyword = async (keyword: string, month?: number, year?: number): Promise<Article[]> => {
  try {
    let query = supabase
      .from('articles')
      .select('*')
      .contains('keywords', [keyword])
      .eq('deleted', false);
    
    // Add month and year filters if provided
    if (month !== undefined && year !== undefined) {
      query = query.eq('month', month).eq('year', year);
    }
    
    const { data: articles, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return articles.map(mapArticleFromDb);
  } catch (error) {
    return handleApiError(error);
  }
};

// Function to get all available issue dates
export const getAvailableIssues = async (): Promise<{ month: number; year: number }[]> => {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('month, year')
      .eq('deleted', false)
      .order('year', { ascending: false })
      .order('month', { ascending: false });
    
    if (error) {
      throw new Error(error.message);
    }

    // Remove duplicates
    return Array.from(new Set(data.map(a => `${a.month}-${a.year}`)))
      .map(dateStr => {
        const [month, year] = dateStr.split('-').map(Number);
        return { month, year };
      });
  } catch (error) {
    console.error("Error fetching available issues:", error);
    return [{ month: 4, year: 2025 }];
  }
};

// Function to delete an article from Supabase
export const deleteArticle = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('articles' as any)
      .update({ 
        deleted: true, 
        deleted_at: new Date().toISOString() 
      } as any)
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
    
    toast.success("Article marked as deleted");
    return true;
  } catch (error) {
    console.error("Error deleting article:", error);
    toast.error("Failed to delete article");
    return false;
  }
};

// Function to update article display order
export const updateArticlesOrder = async (articlesOrder: { id: string, position: number }[]): Promise<boolean> => {
  try {
    // Use a more robust approach with a transaction-like pattern
    for (const item of articlesOrder) {
      const { error } = await supabase
        .from('articles' as any)
        .update({ display_position: item.position })
        .eq('id', item.id);
      
      if (error) {
        console.error(`Error updating article ${item.id}:`, error);
        throw error;
      }
    }
    
    console.log("Articles order updated successfully", articlesOrder);
    toast.success("Articles order updated successfully");
    return true;
  } catch (error) {
    console.error("Error updating articles order:", error);
    toast.error("Failed to update article order");
    return false;
  }
};
