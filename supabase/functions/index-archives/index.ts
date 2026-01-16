import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple HTML to text extraction
function htmlToText(html: string): string {
  // Remove script and style tags and their content
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Remove all HTML tags
  text = text.replace(/<[^>]+>/g, ' ');
  
  // Decode common HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&rsquo;/g, "'");
  text = text.replace(/&lsquo;/g, "'");
  text = text.replace(/&rdquo;/g, '"');
  text = text.replace(/&ldquo;/g, '"');
  text = text.replace(/&mdash;/g, '—');
  text = text.replace(/&ndash;/g, '–');
  text = text.replace(/&#\d+;/g, '');
  
  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all back issues
    const { data: backIssues, error: fetchError } = await supabase
      .from('back_issues')
      .select('*')
      .not('url', 'is', null)
      .order('id', { ascending: true });

    if (fetchError) {
      throw new Error(`Failed to fetch back issues: ${fetchError.message}`);
    }

    console.log(`Found ${backIssues?.length || 0} back issues to index`);

    const results: { issue: string; success: boolean; error?: string }[] = [];

    for (const issue of backIssues || []) {
      try {
        console.log(`Fetching ${issue.display_issue}: ${issue.url}`);
        
        const response = await fetch(issue.url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const html = await response.text();
        const textContent = htmlToText(html);
        
        console.log(`Extracted ${textContent.length} chars from ${issue.display_issue}`);

        // Upsert into the index
        const { error: upsertError } = await supabase
          .from('archive_search_index')
          .upsert({
            back_issue_id: issue.id,
            display_issue: issue.display_issue || `Archive ${issue.id}`,
            url: issue.url,
            text_content: textContent,
            indexed_at: new Date().toISOString(),
          }, {
            onConflict: 'back_issue_id'
          });

        if (upsertError) {
          throw new Error(`Upsert failed: ${upsertError.message}`);
        }

        results.push({ issue: issue.display_issue || `Archive ${issue.id}`, success: true });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error indexing ${issue.display_issue}:`, errorMessage);
        results.push({ 
          issue: issue.display_issue || `Archive ${issue.id}`, 
          success: false, 
          error: errorMessage 
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`Indexing complete: ${successCount}/${results.length} successful`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        indexed: successCount,
        total: results.length,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in index-archives:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to index archives';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
