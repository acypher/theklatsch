import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Article } from '@/lib/types';
import { mapArticleFromDb } from '@/lib/data/utils';

export const useAllArticlesForSearch = () => {
  const { data: allArticlesForSearch = [] } = useQuery<Article[]>({
    queryKey: ['articles', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('deleted', false)
        .order('display_position', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return (data || []).map(mapArticleFromDb);
    },
    staleTime: 5 * 60 * 1000,
  });

  return { allArticlesForSearch };
};
