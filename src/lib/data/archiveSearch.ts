import { supabase } from "@/integrations/supabase/client";

export interface ArchiveSearchResult {
  id: string;
  back_issue_id: number;
  display_issue: string;
  url: string;
  text_content: string;
  snippet: string;
}

/**
 * Search indexed archive content
 */
export async function searchArchives(query: string): Promise<ArchiveSearchResult[]> {
  if (!query.trim()) {
    return [];
  }

  const searchTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 0);
  
  const { data, error } = await supabase
    .from('archive_search_index')
    .select('*');

  if (error) {
    console.error('Error searching archives:', error);
    return [];
  }

  if (!data) {
    return [];
  }

  // Filter and create snippets
  const results: ArchiveSearchResult[] = [];
  
  for (const item of data) {
    const textLower = item.text_content.toLowerCase();
    
    // Check if all search terms are found
    const allTermsFound = searchTerms.every(term => textLower.includes(term));
    
    if (allTermsFound) {
      // Create a snippet around the first match
      const firstTermIndex = textLower.indexOf(searchTerms[0]);
      const snippetStart = Math.max(0, firstTermIndex - 80);
      const snippetEnd = Math.min(item.text_content.length, firstTermIndex + 120);
      
      let snippet = item.text_content.substring(snippetStart, snippetEnd);
      if (snippetStart > 0) snippet = '...' + snippet;
      if (snippetEnd < item.text_content.length) snippet = snippet + '...';
      
      results.push({
        id: item.id,
        back_issue_id: item.back_issue_id,
        display_issue: item.display_issue,
        url: item.url,
        text_content: item.text_content,
        snippet: snippet.trim()
      });
    }
  }

  return results;
}

/**
 * Trigger archive indexing (admin only)
 */
export async function indexArchives(): Promise<{ success: boolean; message: string }> {
  const { data, error } = await supabase.functions.invoke('index-archives');
  
  if (error) {
    console.error('Error indexing archives:', error);
    return { success: false, message: error.message };
  }
  
  return { 
    success: data?.success || false, 
    message: `Indexed ${data?.indexed || 0} of ${data?.total || 0} archives` 
  };
}
