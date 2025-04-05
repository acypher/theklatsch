
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAvailableIssues, getCurrentIssue } from "@/lib/data";

interface IssueSelectorProps {
  onIssueChange: (month: number, year: number) => void;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

const IssueSelector = ({ onIssueChange }: IssueSelectorProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [availableIssues, setAvailableIssues] = useState<{ month: number; year: number }[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadIssues = async () => {
      try {
        setIsLoading(true);
        const issues = await getAvailableIssues();
        setAvailableIssues(issues);
        
        const monthParam = searchParams.get("month");
        const yearParam = searchParams.get("year");
        
        if (monthParam && yearParam) {
          setSelectedIssue(`${monthParam}-${yearParam}`);
        } else {
          const currentIssue = await getCurrentIssue();
          setSelectedIssue(`${currentIssue.month}-${currentIssue.year}`);
          
          // If no URL parameters are set, update the URL with the current issue
          if (!monthParam && !yearParam) {
            setSearchParams({ 
              month: currentIssue.month.toString(), 
              year: currentIssue.year.toString() 
            });
            onIssueChange(currentIssue.month, currentIssue.year);
          }
        }
      } catch (error) {
        console.error("Error loading issues:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadIssues();
  }, [searchParams, onIssueChange, setSearchParams]);

  const handleIssueChange = (value: string) => {
    const [month, year] = value.split("-").map(Number);
    setSelectedIssue(value);
    setSearchParams({ month: month.toString(), year: year.toString() });
    onIssueChange(month, year);
  };

  const formatIssue = (month: number, year: number): string => {
    return `${MONTHS[month - 1]} ${year}`;
  };

  if (isLoading) {
    return <div className="text-muted-foreground text-sm">Loading issues...</div>;
  }

  return (
    <Select value={selectedIssue} onValueChange={handleIssueChange}>
      <SelectTrigger className="w-auto !py-1 !h-8 border-transparent hover:border-input group text-2xl font-bold text-primary">
        <SelectValue placeholder="Select Issue" />
        <div className="absolute right-2 hidden group-hover:block">
          <svg className="h-4 w-4 opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </SelectTrigger>
      <SelectContent className="bg-background min-w-[120px] w-auto">
        {availableIssues.map((issue) => (
          <SelectItem 
            key={`${issue.month}-${issue.year}`} 
            value={`${issue.month}-${issue.year}`}
            className="!pl-2 !pr-2 !py-1"
          >
            {formatIssue(issue.month, issue.year)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default IssueSelector;
