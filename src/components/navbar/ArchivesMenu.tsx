
import React from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BackIssue {
  id: number;
  display_issue: string | null;
  url: string | null;
}

interface ArchivesMenuProps {
  backIssues: BackIssue[];
  loadingArchives: boolean;
}

const ArchivesMenu = ({ backIssues, loadingArchives }: ArchivesMenuProps) => {
  // Sort the backIssues array in ascending order (oldest first)
  const sortedBackIssues = [...backIssues].sort((a, b) => a.id - b.id);

  const handleArchiveClick = (issue: BackIssue) => {
    if (issue.url) {
      window.open(issue.url, '_blank');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          id="archivesButton" 
          className="text-base font-semibold text-muted-foreground ml-2 flex items-center"
          disabled={loadingArchives}
        >
          Archives
          <ChevronDown className="h-4 w-4 ml-1" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 bg-background">
        {loadingArchives ? (
          <DropdownMenuItem disabled>Loading archives...</DropdownMenuItem>
        ) : sortedBackIssues.length > 0 ? (
           sortedBackIssues.map((issue) => (
             <DropdownMenuItem
               key={issue.id}
               className="cursor-pointer"
               onClick={() => handleArchiveClick(issue)}
             >
              {issue.display_issue || `Archive ${issue.id}`}
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>No archives available</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ArchivesMenu;
