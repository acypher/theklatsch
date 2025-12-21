
import React from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Issue } from "@/lib/data/issue/availableIssues";

interface IssueSelectorProps {
  currentIssue: string;
  issues: Issue[];
  loading: boolean;
  onIssueChange: (issueText: string) => Promise<void>;
}

const IssueSelector = ({ currentIssue, issues, loading, onIssueChange }: IssueSelectorProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          id="currentIssue"
          className="text-2xl font-bold text-primary ml-2 flex items-center"
          disabled={loading}
          onClick={(e) => {
            // Prevent the surrounding <Link> in Navbar from navigating
            e.preventDefault();
            e.stopPropagation();
          }}
          onPointerDownCapture={(e) => {
            // Ensure Radix trigger works without triggering parent navigation
            e.stopPropagation();
          }}
        >
          {currentIssue}
          <ChevronDown className="h-5 w-5 ml-1" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 bg-background">
        {issues.length > 0 ? (
          issues.map((issue) => (
            <DropdownMenuItem
              key={`${issue.month}-${issue.year}`}
              className="cursor-pointer"
              onSelect={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                await onIssueChange(issue.text);
              }}
            >
              {issue.text}
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>No issues available</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default IssueSelector;
