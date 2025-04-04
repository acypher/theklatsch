
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
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [years, setYears] = useState<number[]>([]);

  useEffect(() => {
    const loadIssues = async () => {
      try {
        // Get all available issues
        const issues = await getAvailableIssues();
        setAvailableIssues(issues);
        
        // Extract unique years
        const uniqueYears = Array.from(new Set(issues.map(i => i.year))).sort((a, b) => b - a);
        setYears(uniqueYears);
        
        // Set default selected issue either from URL or from current settings
        const monthParam = searchParams.get("month");
        const yearParam = searchParams.get("year");
        
        if (monthParam && yearParam) {
          setSelectedMonth(parseInt(monthParam));
          setSelectedYear(parseInt(yearParam));
        } else {
          const currentIssue = await getCurrentIssue();
          setSelectedMonth(currentIssue.month);
          setSelectedYear(currentIssue.year);
        }
      } catch (error) {
        console.error("Error loading issues:", error);
      }
    };
    
    loadIssues();
  }, [searchParams]);

  // When month changes
  const handleMonthChange = (value: string) => {
    const month = parseInt(value);
    setSelectedMonth(month);
    
    if (selectedYear) {
      setSearchParams({ month: month.toString(), year: selectedYear.toString() });
      onIssueChange(month, selectedYear);
    }
  };
  
  // When year changes
  const handleYearChange = (value: string) => {
    const year = parseInt(value);
    setSelectedYear(year);
    
    if (selectedMonth) {
      setSearchParams({ month: selectedMonth.toString(), year: year.toString() });
      onIssueChange(selectedMonth, year);
    }
  };

  // Get available months for the selected year
  const getAvailableMonths = () => {
    if (!selectedYear) return [];
    return availableIssues
      .filter(issue => issue.year === selectedYear)
      .map(issue => issue.month);
  };

  if (!selectedMonth || !selectedYear) {
    return <div className="text-muted-foreground text-sm">Loading issues...</div>;
  }

  return (
    <div className="flex items-center gap-2">
      <div>
        <Select value={selectedMonth.toString()} onValueChange={handleMonthChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {getAvailableMonths().map((month) => (
              <SelectItem key={month} value={month.toString()}>
                {MONTHS[month - 1]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default IssueSelector;
