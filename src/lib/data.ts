
import { Article, CurrentIssue, Setting } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";

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

    // Remove duplicates and ensure values are numbers
    const uniqueIssues = new Map<string, { month: number; year: number }>();
    
    data?.forEach(item => {
      if (item.month && item.year) {
        const key = `${item.month}-${item.year}`;
        uniqueIssues.set(key, { 
          month: Number(item.month), 
          year: Number(item.year) 
        });
      }
    });
    
    return Array.from(uniqueIssues.values());
  } catch (error) {
    console.error("Error fetching available issues:", error);
    return [{ month: 4, year: 2025 }, { month: 5, year: 2025 }];
  }
};

export const getCurrentIssue = async (): Promise<CurrentIssue> => {
  try {
    // First check if the setting exists
    const { data: settingExists, error: checkError } = await supabase
      .from('settings')
      .select('id')
      .eq('key', 'current_issue')
      .maybeSingle();
    
    if (checkError) {
      throw new Error(checkError.message);
    }
    
    // If setting doesn't exist, create it with default values
    if (!settingExists) {
      const defaultIssue = { month: 5, year: 2025 };
      
      const { error: insertError } = await supabase
        .from('settings')
        .insert({
          key: 'current_issue',
          value: defaultIssue
        });
      
      if (insertError) {
        throw new Error(insertError.message);
      }
      
      return defaultIssue;
    }
    
    // Now we can safely get the setting
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'current_issue')
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    // Fix: Properly cast the value to CurrentIssue with type safety
    const value = data?.value as Record<string, any>;
    
    return {
      month: typeof value?.month === 'number' ? value.month : 5,
      year: typeof value?.year === 'number' ? value.year : 2025
    };
  } catch (error) {
    console.error("Error fetching current issue:", error);
    // Default to May 2025 if there's an error
    return { month: 5, year: 2025 };
  }
};

export const getArticlesByIssue = async (month: number, year: number): Promise<Article[]> => {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('month', month)
      .eq('year', year)
      .eq('deleted', false)
      .order('display_position', { ascending: true });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data.map(mapDatabaseArticleToModel);
  } catch (error) {
    console.error("Error fetching articles by issue:", error);
    return [];
  }
};

export const getArticleById = async (id: string): Promise<Article | null> => {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .eq('deleted', false)
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return mapDatabaseArticleToModel(data);
  } catch (error) {
    console.error(`Error fetching article with ID ${id}:`, error);
    return null;
  }
};

export const getArticlesByKeyword = async (keyword: string, month?: number, year?: number): Promise<Article[]> => {
  try {
    let query = supabase
      .from('articles')
      .select('*')
      .eq('deleted', false)
      .contains('keywords', [keyword]);
    
    if (month) {
      query = query.eq('month', month);
    }
    
    if (year) {
      query = query.eq('year', year);
    }
    
    const { data, error } = await query.order('display_position', { ascending: true });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data.map(mapDatabaseArticleToModel);
  } catch (error) {
    console.error(`Error fetching articles with keyword ${keyword}:`, error);
    return [];
  }
};

export const getAllArticles = async (): Promise<Article[]> => {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('deleted', false)
      .order('display_position', { ascending: true });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data.map(mapDatabaseArticleToModel);
  } catch (error) {
    console.error("Error fetching all articles:", error);
    return [];
  }
};

export const addArticle = async (article: Omit<Article, 'id' | 'createdAt'>): Promise<Article> => {
  try {
    // Get the current issue to set month and year
    const currentIssue = await getCurrentIssue();
    
    const { data, error } = await supabase
      .from('articles')
      .insert({
        title: article.title,
        description: article.description,
        author: article.author,
        keywords: article.keywords,
        imageurl: article.imageUrl,
        sourceurl: article.sourceUrl,
        more_content: article.more_content,
        month: currentIssue.month,
        year: currentIssue.year
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return mapDatabaseArticleToModel(data);
  } catch (error) {
    console.error("Error adding article:", error);
    throw error;
  }
};

export const updateArticle = async (id: string, updates: Partial<Omit<Article, 'id' | 'createdAt'>>): Promise<Article> => {
  try {
    const updateData: Record<string, any> = {};
    
    if (updates.title) updateData.title = updates.title;
    if (updates.description) updateData.description = updates.description;
    if (updates.author) updateData.author = updates.author;
    if (updates.keywords) updateData.keywords = updates.keywords;
    if (updates.imageUrl) updateData.imageurl = updates.imageUrl;
    if (updates.sourceUrl !== undefined) updateData.sourceurl = updates.sourceUrl;
    if (updates.more_content !== undefined) updateData.more_content = updates.more_content;
    
    const { data, error } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return mapDatabaseArticleToModel(data);
  } catch (error) {
    console.error(`Error updating article with ID ${id}:`, error);
    throw error;
  }
};

export const deleteArticle = async (id: string): Promise<boolean> => {
  try {
    // Soft delete by setting the deleted flag to true
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
    
    return true;
  } catch (error) {
    console.error(`Error deleting article with ID ${id}:`, error);
    return false;
  }
};

export const updateArticlesOrder = async (articlesOrder: { id: string; position: number }[]): Promise<boolean> => {
  try {
    // Fix: Use a transaction to update multiple records
    // We need to update each article individually as upsert doesn't support array of partial updates
    for (const item of articlesOrder) {
      const { error } = await supabase
        .from('articles')
        .update({ display_position: item.position })
        .eq('id', item.id);
      
      if (error) {
        throw new Error(error.message);
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error updating article order:", error);
    return false;
  }
};

// Helper function to map database article format to our application model
function mapDatabaseArticleToModel(dbArticle: any): Article {
  return {
    id: dbArticle.id,
    title: dbArticle.title,
    description: dbArticle.description,
    author: dbArticle.author,
    keywords: dbArticle.keywords || [],
    imageUrl: dbArticle.imageurl,
    sourceUrl: dbArticle.sourceurl || '',
    createdAt: dbArticle.created_at,
    more_content: dbArticle.more_content,
    deleted: dbArticle.deleted,
    deletedAt: dbArticle.deleted_at,
    month: dbArticle.month,
    year: dbArticle.year
  };
}
