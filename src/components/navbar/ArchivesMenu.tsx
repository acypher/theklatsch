
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
  onArchiveClick: (url: string | null) => void;
}

const ArchivesMenu = ({ backIssues, loadingArchives, onArchiveClick }: ArchivesMenuProps) => {
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
        {backIssues.length > 0 ? (
          backIssues.map((issue) => (
            <DropdownMenuItem
              key={issue.id}
              className="cursor-pointer"
              onClick={() => onArchiveClick(issue.url)}
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
