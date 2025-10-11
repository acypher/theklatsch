import { supabase } from "@/integrations/supabase/client";

// Function to determine the appropriate display position based on keywords/tags
export const determineDisplayPosition = async (keywords: string[], month: number, year: number): Promise<number> => {
  try {
    // RULE 1: If it has a "venue" tag, place it at position 1
    if (keywords.includes('venue')) {
      return 1;
    }
    
    // Get current articles for this issue sorted by position
    const { data: articles, error } = await supabase
      .from('articles')
      .select('id, keywords, display_position')
      .eq('month', month)
      .eq('year', year)
      .eq('deleted', false)
      .order('display_position', { ascending: true });
    
    if (error) {
      console.error("Error fetching articles for position determination:", error);
      return 999; // Default to a high position if there's an error
    }
    
    // If no articles exist yet
    if (!articles || articles.length === 0) {
      return 1;
    }
    
    // RULE 2: If it has a "lists" tag, place it at the very end (after all other articles)
    if (keywords.includes('lists')) {
      const maxPosition = articles.length > 0 
        ? Math.max(...articles.map(a => a.display_position || 0)) + 1 
        : 1;
      return maxPosition;
    }
    
    // RULE 3: If it has an "ott" tag
    if (keywords.includes('ott')) {
      // Find the position after the last article with 'venue' or 'ott' tags
      let position = 1;
      let allPreviousHaveRequiredTags = true;
      
      for (let i = 0; i < articles.length; i++) {
        const articleKeywords = articles[i].keywords || [];
        if (articleKeywords.includes('venue') || articleKeywords.includes('ott')) {
          // This article has a required tag
          position = (articles[i].display_position || 0) + 1;
        } else {
          // Found an article without required tags, stop here
          allPreviousHaveRequiredTags = false;
          break;
        }
      }
      
      // If all articles had required tags, position should be after the last one
      if (allPreviousHaveRequiredTags) {
        return position;
      } else {
        // Otherwise, find the first position where an article doesn't have required tags
        for (let i = 0; i < articles.length; i++) {
          const articleKeywords = articles[i].keywords || [];
          if (!(articleKeywords.includes('venue') || articleKeywords.includes('ott'))) {
            return articles[i].display_position || i + 1;
          }
        }
        return position;
      }
    }
    
    // RULE 4: If it has a "tmm" tag
    if (keywords.includes('tmm')) {
      // Find the position after the last article with 'venue', 'ott', or 'tmm' tags
      let position = 1;
      let allPreviousHaveRequiredTags = true;
      
      for (let i = 0; i < articles.length; i++) {
        const articleKeywords = articles[i].keywords || [];
        if (
          articleKeywords.includes('venue') || 
          articleKeywords.includes('ott') || 
          articleKeywords.includes('tmm')
        ) {
          // This article has a required tag
          position = (articles[i].display_position || 0) + 1;
        } else {
          // Found an article without required tags, stop here
          allPreviousHaveRequiredTags = false;
          break;
        }
      }
      
      // If all articles had required tags, position should be after the last one
      if (allPreviousHaveRequiredTags) {
        return position;
      } else {
        // Otherwise, find the first position where an article doesn't have required tags
        for (let i = 0; i < articles.length; i++) {
          const articleKeywords = articles[i].keywords || [];
          if (!(
            articleKeywords.includes('venue') || 
            articleKeywords.includes('ott') || 
            articleKeywords.includes('tmm')
          )) {
            return articles[i].display_position || i + 1;
          }
        }
        return position;
      }
    }
    
    // RULE 5: Otherwise, place it before any "lists" articles
    // Find the first "lists" article position, or use max position if none exist
    let firstListsPosition = null;
    for (let i = 0; i < articles.length; i++) {
      const articleKeywords = articles[i].keywords || [];
      if (articleKeywords.includes('lists')) {
        firstListsPosition = articles[i].display_position || (i + 1);
        break;
      }
    }
    
    if (firstListsPosition !== null) {
      return firstListsPosition;
    } else {
      const maxPosition = articles.length > 0 
        ? Math.max(...articles.map(a => a.display_position || 0)) + 1 
        : 1;
      return maxPosition;
    }
  } catch (error) {
    console.error("Error in determineDisplayPosition:", error);
    return 999; // Default to a high position if there's an error
  }
};

// Function to get the maximum display position for a given month and year
export const getMaxDisplayPosition = async (month: number, year: number): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('display_position')
      .eq('month', month)
      .eq('year', year)
      .eq('deleted', false)
      .order('display_position', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error("Error fetching max display position:", error);
      return 1; // Default to 1 if there's an error
    }
    
    if (data && data.length > 0 && data[0].display_position !== null) {
      return data[0].display_position + 1; // Return the max position + 1
    }
    
    return 1; // If no articles exist yet, return 1
  } catch (error) {
    console.error("Error in getMaxDisplayPosition:", error);
    return 1;
  }
};
