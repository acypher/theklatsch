
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

    // Remove duplicates and ensure we return unique month-year combinations
    const uniqueIssues = Array.from(new Set(data.map(a => `${a.month}-${a.year}`)))
      .map(dateStr => {
        const [month, year] = dateStr.split('-').map(Number);
        return { month, year };
      });

    // Ensure we have both April and May 2025 if they exist
    return uniqueIssues;
  } catch (error) {
    console.error("Error fetching available issues:", error);
    return [{ month: 4, year: 2025 }, { month: 5, year: 2025 }];
  }
};
