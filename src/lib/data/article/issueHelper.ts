
// Function to parse an issue string into month and year
export const parseIssueString = (issueString: string): { month: number | null, year: number | null } => {
  const months = {
    "January": 1, "February": 2, "March": 3, "April": 4, "May": 5, "June": 6, 
    "July": 7, "August": 8, "September": 9, "October": 10, "November": 11, "December": 12
  };
  
  try {
    const parts = issueString.trim().split(' ');
    if (parts.length !== 2) return { month: null, year: null };
    
    const monthName = parts[0];
    const year = parseInt(parts[1]);
    
    const month = months[monthName as keyof typeof months];
    
    if (!month || isNaN(year)) return { month: null, year: null };
    
    return { month, year };
  } catch (error) {
    console.error("Error parsing issue string:", error);
    return { month: null, year: null };
  }
};
