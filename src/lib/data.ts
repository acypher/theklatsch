import { Article } from './types';
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
    createdAt: "2023-06-15T10:30:00Z"
  },
  {
    id: "2",
    title: "Machine Learning Basics",
    description: "A beginner-friendly introduction to machine learning concepts and applications.",
    author: "Michael Chen",
    keywords: ["Machine Learning", "AI", "Data Science"],
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    sourceUrl: "https://example.com/ml-basics",
    createdAt: "2023-05-22T14:20:00Z"
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
    deletedAt: dbArticle.deleted_at
  };
};

// Function to fetch all articles from Supabase
export const getAllArticles = async (): Promise<Article[]> => {
  try {
    const { data: articles, error } = await supabase
      .from('articles')
      .select('*')
      .eq('deleted', false)
      .order('display_position', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    if (articles && articles.length > 0) {
      return articles.map(mapArticleFromDb);
    } else {
      console.log("No articles found in database, using default articles");
      return DEFAULT_ARTICLES;
    }
  } catch (error) {
    return handleApiError(error);
  }
};

// Function to get article by ID
export const getArticleById = async (id: string): Promise<Article | undefined> => {
  try {
    const { data: article, error } = await supabase
      .from('articles')
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
    const newArticle = {
      title: article.title,
      description: article.description,
      author: article.author,
      keywords: article.keywords,
      imageurl: article.imageUrl,
      sourceurl: article.sourceUrl,
      more_content: article.more_content,
      user_id: (await supabase.auth.getUser()).data.user?.id
    };
    
    const { data, error } = await supabase
      .from('articles')
      .insert(newArticle)
      .select()
      .single();

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
    
    const { data, error } = await supabase
      .from('articles')
      .update(updatedArticle)
      .eq('id', id)
      .select()
      .single();

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
export const getArticlesByKeyword = async (keyword: string): Promise<Article[]> => {
  try {
    const { data: articles, error } = await supabase
      .from('articles')
      .select('*')
      .contains('keywords', [keyword])
      .eq('deleted', false)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return articles.map(mapArticleFromDb);
  } catch (error) {
    return handleApiError(error);
  }
};

// Function to delete an article from Supabase
export const deleteArticle = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('articles')
      .update({ 
        deleted: true, 
        deleted_at: new Date().toISOString() 
      })
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
    // Log what we're updating for debugging
    console.log("Updating article order with:", articlesOrder);
    
    // Track if all updates are successful
    let allSuccessful = true;
    
    // Perform updates one by one
    for (const item of articlesOrder) {
      console.log(`Updating article ${item.id} to position ${item.position}`);
      
      const { error } = await supabase
        .from('articles')
        .update({ display_position: item.position })
        .eq('id', item.id);
      
      if (error) {
        console.error(`Error updating article ${item.id} position:`, error);
        allSuccessful = false;
      }
    }
    
    if (allSuccessful) {
      console.log("All articles positions updated successfully");
      return true;
    } else {
      console.error("Some article position updates failed");
      return false;
    }
  } catch (error) {
    console.error("Error updating articles order:", error);
    toast.error("Failed to update article order");
    return false;
  }
};

// Function to get current issue data - updated to handle JSON string format
export const getCurrentIssue = async (): Promise<{ text: string } | null> => {
  try {
    const { data, error } = await supabase
      .from('issue')
      .select('value')
      .eq('key', 'display_issue')
      .single();
    
    if (error) {
      console.error("Error fetching current issue:", error);
      return null;
    }
    
    // Handle the JSON string format - transform it to { text: string } format for compatibility
    if (data?.value) {
      const issueText = typeof data.value === 'string' ? data.value : JSON.stringify(data.value);
      return { text: issueText.replace(/^"|"$/g, '') }; // Remove surrounding quotes if present
    }
    
    return null;
  } catch (error) {
    console.error("Error in getCurrentIssue:", error);
    return null;
  }
};

// Function to update the current month and year in the issue table - updated to handle string format
export const updateCurrentMonthYear = async (month: number, year: number): Promise<boolean> => {
  try {
    // Update display_month - convert to string and store as JSON string
    const { error: monthError } = await supabase
      .from('issue')
      .update({ value: JSON.stringify(month.toString()) })
      .eq('key', 'display_month');
    
    if (monthError) {
      console.error("Error updating current month:", monthError);
      return false;
    }
    
    // Update display_year - convert to string and store as JSON string
    const { error: yearError } = await supabase
      .from('issue')
      .update({ value: JSON.stringify(year.toString()) })
      .eq('key', 'display_year');
    
    if (yearError) {
      console.error("Error updating current year:", yearError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error updating current month/year:", error);
    return false;
  }
};

// Function to get the maintenance mode status
export const getMaintenanceMode = async (): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('vars')
      .select('value')
      .eq('key', 'maintenance')
      .single();
    
    if (error) {
      console.error("Error fetching maintenance mode:", error);
      return 'normal'; // Default to normal mode if there's an error
    }
    
    return data?.value || 'normal';
  } catch (error) {
    console.error("Error in getMaintenanceMode:", error);
    return 'normal'; // Default to normal mode if there's an error
  }
};

// Function to update the maintenance mode
export const updateMaintenanceMode = async (mode: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('vars')
      .update({ 
        value: mode,
        updated_at: new Date().toISOString()
      })
      .eq('key', 'maintenance');
    
    if (error) {
      console.error("Error updating maintenance mode:", error);
      toast.error("Failed to update maintenance mode");
      return false;
    }
    
    toast.success(`Maintenance mode updated to: ${mode}`);
    return true;
  } catch (error) {
    console.error("Error in updateMaintenanceMode:", error);
    toast.error("Failed to update maintenance mode");
    return false;
  }
};
