import { useQuery } from '@tanstack/react-query';
import { getAllArticles } from '@/lib/data';
import { Article } from '@/lib/types';

export const useArticles = (currentIssue: string) => {
  const { data: articles = [], isLoading } = useQuery<Article[]>({
    queryKey: ['articles', currentIssue],
    queryFn: () => getAllArticles(currentIssue),
    enabled: !!currentIssue,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes - keep cached data much longer to avoid reload on back-navigation
  });

  return { articles, isLoading };
};
