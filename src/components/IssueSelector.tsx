
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

  useEffect(() => {
    const loadIssues = async () => {
      try {
        // Get all available issues
        const issues = await getAvailableIssues();
        setAvailableIssues(issues);
        
        // Set default selected issue either from URL or from current settings
        const monthParam = searchParams.get("month");
        const yearParam = searchParams.get("year");
        
        if (monthParam && yearParam) {
          setSelectedIssue(`${monthParam}-${yearParam}`);
        } else {
          const currentIssue = await getCurrentIssue();
          setSelectedIssue(`${currentIssue.month}-${currentIssue.year}`);
        }
      } catch (error) {
        console.error("Error loading issues:", error);
      }
    };
    
    loadIssues();
  }, [searchParams]);

  // When issue selection changes
  const handleIssueChange = (value: string) => {
    const [month, year] = value.split("-").map(Number);
    setSelectedIssue(value);
    setSearchParams({ month: month.toString(), year: year.toString() });
    onIssueChange(month, year);
  };

  // Format issue as "Month Year"
  const formatIssue = (month: number, year: number): string => {
    return `${MONTHS[month - 1]} ${year}`;
  };

  if (!selectedIssue) {
    return <div className="text-muted-foreground text-sm">Loading issues...</div>;
  }

  return (
    <Select value={selectedIssue} onValueChange={handleIssueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select Issue" />
      </SelectTrigger>
      <SelectContent className="bg-background">
        {availableIssues.map((issue) => (
          <SelectItem 
            key={`${issue.month}-${issue.year}`} 
            value={`${issue.month}-${issue.year}`}
          >
            {formatIssue(issue.month, issue.year)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default IssueSelector;
