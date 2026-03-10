import { supabase } from "@/integrations/supabase/client";

// Function to determine the appropriate display position based on keywords/tags
export const determineDisplayPosition = async (keywords: string[], month: number, year: number): Promise<number> => {
  try {
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
      return 999;
    }
    
    if (!articles || articles.length === 0) {
      return 1;
    }

    // Count existing venue and ott articles to determine proper positioning
    const venueCount = articles.filter(a => (a.keywords || []).includes('venue')).length;
    const ottCount = articles.filter(a => (a.keywords || []).includes('ott')).length;

    // RULE 1: venue articles go first (position 1..venueCount)
    if (keywords.includes('venue')) {
      // Place at the end of the venue block
      return venueCount; // This will be re-sorted, but ensures it's in the venue zone
    }

    // RULE 2: lists articles go at the very end
    if (keywords.includes('lists')) {
      const maxPosition = Math.max(...articles.map(a => a.display_position || 0)) + 1;
      return maxPosition;
    }

    // RULE 3: ott articles go right after venue articles
    if (keywords.includes('ott')) {
      // Position after all venue articles
      // Find the display_position of the last venue article, or start at 1
      const venueArticles = articles.filter(a => (a.keywords || []).includes('venue'));
      if (venueArticles.length > 0) {
        const lastVenuePos = Math.max(...venueArticles.map(a => a.display_position || 0));
        return lastVenuePos + 1;
      }
      return 1;
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
