
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PenLine, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Issue, getAvailableIssues, setCurrentIssue } from "@/lib/data/issue/availableIssues";
import { toast } from "sonner";
import ReadFilter from "./article/ReadFilter";
import { supabase } from "@/integrations/supabase/client";
import UserMenu from "./navbar/UserMenu";
import IssueSelector from "./navbar/IssueSelector";
import ArchivesMenu from "./navbar/ArchivesMenu";
import SearchBar from "./SearchBar";

interface NavbarProps {
  onLogoClick?: () => void;
  currentIssue?: string;
  showReadFilter?: boolean;
  filterEnabled?: boolean;
  onFilterToggle?: (enabled: boolean) => void;
  onSearch?: (query: string) => void;
  onClearSearch?: () => void;
  searchQuery?: string;
}

const Navbar = ({ 
  onLogoClick, 
  currentIssue, 
  showReadFilter = false,
  filterEnabled = false,
  onFilterToggle,
  onSearch,
  onClearSearch,
  searchQuery = ""
}: NavbarProps) => {
  const { user, profile, signOut } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [backIssues, setBackIssues] = useState<any[]>([]);
  const [loadingArchives, setLoadingArchives] = useState(false);

  useEffect(() => {
    const loadIssues = async () => {
      const availableIssues = await getAvailableIssues();
      setIssues(availableIssues);
    };
    loadIssues();
  }, []);

  const getUserInitials = () => {
    if (!user) return "?";
    
    if (profile?.display_name) {
      const nameParts = profile.display_name.split(" ");
      if (nameParts.length >= 2) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return profile.display_name.substring(0, 2).toUpperCase();
    }
    
    if (user.email) {
      const emailParts = user.email.split('@')[0].split('.');
      if (emailParts.length >= 2) {
        return `${emailParts[0][0]}${emailParts[1][0]}`.toUpperCase();
      }
      return user.email.substring(0, 2).toUpperCase();
    }
    
    return "??";
  };

  const handleLogoClick = (event: React.MouseEvent) => {
    if (onLogoClick) {
      event.preventDefault();
      onLogoClick();
    }
  };

I’m on page “theklatsch - Lovable” with “This page generally shows the current issue (September 2025 at the moment). There is also a menu at the top, labeled "Archives". It is a pulldown listed all existing issues. The user can select one of these, and the page is supposed to change to display the issue for that month.  But that's not what is happening.  In Lovable's Preview window,  I picked January 2025 from the Archive list, it  momentarily switched to April 2025, and then back to the current issue.

It sounds like you're experiencing a bug with the archive selection functionality on your Lovable project. The behavior you're describing - where selecting January 2025 briefly shows April 2025 before reverting to the current issue - suggests there might be an issue with:

    State management - The selected archive value might not be properly persisting or updating the displayed content
    Event handling - The dropdown selection might be triggering multiple state changes or conflicting updates
    Data fetching/filtering - The logic that retrieves and displays the archive content might have a race condition or incorrect logic

To help troubleshoot this, I'd need to see your code. Could you share:

    The component that handles the archive dropdown
    The state management logic for switching between issues
    Any data fetching or filtering logic related to displaying different months

Alternatively, if you can share the project URL or relevant code snippets, I can help identify what might be causing this unexpected behavior and suggest a fix.

Are you using React state, a state management library, or some other approach to handle the issue selection?

Using React. The project code is at https://github.com/acypher/theklatsch and is public.  It uses supabase, located at https://supabase.com/dashboard/project/kjfwyaniengzduyeeufq

I'll help you troubleshoot this archive selection issue. Let me fetch your project code from GitHub to examine the implementation.

Let me access the actual repository files to examine the code structure:

I need to access the GitHub repository through the API. Let me try a different approach:

I can see from the GitHub page that this is a Lovable project. Let me search for information about common React state management issues with dropdown selections that might help identify the problem:

Since I can't directly access your repository files, I'll provide some targeted troubleshooting suggestions based on the common patterns I see with React dropdown state issues and Supabase integration. The behavior you're describing (selecting January 2025, briefly showing April 2025, then reverting to current) suggests a few potential issues:
Common Causes and Solutions:
1. Race Condition with useEffect

If you're using useEffect to fetch data when the archive selection changes, you might have multiple effects running simultaneously:
javascript

// Problematic pattern:
useEffect(() => {
  fetchIssueData(selectedMonth);
}, [selectedMonth]);

useEffect(() => {
  // This might be overriding the selected month
  setSelectedMonth(getCurrentMonth());
}, []);

Solution: Make sure your effects have proper dependencies and cleanup:
javascript

useEffect(() => {
  let cancelled = false;
  
  const fetchData = async () => {
    const data = await fetchIssueData(selectedMonth);
    if (!cancelled) {
      setIssueData(data);
    }
  };
  
  fetchData();
  
  return () => {
    cancelled = true;
  };
}, [selectedMonth]);

2. State Update Timing Issues

The dropdown value might be updating correctly, but another piece of code is resetting it:
javascript

// Check if you have something like this that's overriding your selection:
const handleArchiveSelect = (month) => {
  setSelectedMonth(month);
  // Make sure nothing else is calling setSelectedMonth after this
};

3. Supabase Query Caching/Timing

If you're using Supabase's real-time features or have queries that trigger on state changes, there might be conflicting updates.
Debugging Steps:

    Add console logs to track state changes:

javascript

useEffect(() => {
  console.log('Selected month changed to:', selectedMonth);
}, [selectedMonth]);

    Check your dropdown onChange handler:

javascript

const handleArchiveChange = (value) => {
  console.log('Archive selected:', value);
  setSelectedMonth(value);
};

    Verify your Supabase queries aren't triggering unexpected updates.

Could you share the specific component code that handles the archive dropdown and the state management for switching between issues? That would help me provide a more targeted solution.

Alternatively, you could:

    Check the browser's Network tab to see what Supabase queries are being triggered
    Look at the React DevTools to monitor state changes in real-time
    Add temporary logging to identify exactly when and why the state is reverting

How can I give you access to the code?

There are several ways you can share your code with me:
Option 1: Copy and Paste Key Files

You can copy and paste the relevant component files directly into our chat. Focus on:

    The main component that handles the archive dropdown
    Any state management logic for switching between issues
    The component that displays the current issue

Option 2: Share Code Snippets

If the files are large, you can share just the relevant parts:

    The dropdown/select component code
    The state management hooks (useState, useEffect)
    The Supabase query logic

Option 3: GitHub Raw Links

Since your repo is public, you could provide direct links to specific files like:

    https://raw.githubusercontent.com/acypher/theklatsch/main/src/[filename].tsx
    I can fetch these raw file URLs directly

Option 4: Lovable Project

Since this is a Lovable project, if you can make the project publicly viewable, you could share the Lovable project URL.
What I'd Need to See:

To diagnose the archive selection issue, I'd particularly need:

    The component that renders the "Archives" dropdown menu
    The state management code that handles the selected month
    The code that fetches and displays the issue data
    Any useEffect hooks that might be interfering with state

Recommended approach: Start by copying and pasting the main component file that contains the Archives dropdown. That will give me the best starting point to identify the issue.

Which option works best for you?

I just made the Lovable Project public: https://lovable.dev/projects/c93989d9-9b90-4385-bdcf-7f13cd1d4d28

Perfect! Let me access your Lovable project to examine the code.

The project page didn't return the code structure. Let me try accessing the GitHub repository that's linked to this Lovable project, since you mentioned it's at https://github.com/acypher/theklatsch:

I'm having trouble accessing the project files directly. Could you help me by copying and pasting the main component file that contains the Archives dropdown?

Based on typical React project structures, I'm looking for files that might be named something like:

    src/App.tsx or src/App.jsx (if the dropdown is in the main app)
    src/components/Header.tsx (if the Archives menu is in a header component)
    src/pages/Index.tsx (if it's in the main page component)
    Any component file that handles the magazine issue display

You can find these files in your Lovable project editor. Just copy the content of the file that contains:

    The "Archives" dropdown/select element
    The state that manages which issue is currently selected
    The logic that fetches and displays different issues

This will help me identify exactly what's causing the selection to revert back to the current issue.

Three files:
File #1: src/components/navbar/ArchivesMenu.tsx 

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
  onArchiveClick: (issueText: string | null) => void;
}
const ArchivesMenu = ({ backIssues, loadingArchives, onArchiveClick }: ArchivesMenuProps) => {
  // Sort the backIssues array in ascending order (oldest first)
  const sortedBackIssues = [...backIssues].sort((a, b) => a.id - b.id);
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
              onClick={() => onArchiveClick(issue.display_issue)}
            >
              {issue.display_issue || Archive ${issue.id}}
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

File #2: src/components/Navbar.tsx
File #3: src/lib/data/issue/availablelssues.ts

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, addMonths } from "date-fns";
export interface Issue {
  month: number;
  year: number;
  text: string;
}
export const getAvailableIssues = async (): Promise<Issue[]> => {
  try {
    // Get distinct month/year combinations from non-deleted articles
    const { data: articlesData, error: articlesError } = await supabase
      .from('articles')
      .select('month, year')
      .eq('deleted', false)
      .not('month', 'is', null)
      .not('year', 'is', null);
    if (articlesError) {
      throw new Error(articlesError.message);
    }
    // Get back issues to include historical archives
    const { data: backIssues, error: backIssuesError } = await supabase
      .from('back_issues')
      .select('display_issue');
    if (backIssuesError) {
      console.error("Error fetching back issues:", backIssuesError);
    }
    // Create a map to avoid duplicates
    const issueMap = new Map<string, Issue>();

    // Convert month numbers to names
    const monthNames = [
      'January', 'February', 'March', 'April', 
      'May', 'June', 'July', 'August',
      'September', 'October', 'November', 'December'
    ];
    // Process articles data
    articlesData?.forEach(article => {
      if (article.month && article.year) {
        const key = ${article.month}-${article.year};
        if (!issueMap.has(key)) {
          const monthName = monthNames[article.month - 1] || 'Unknown';
          issueMap.set(key, {
            month: article.month,
            year: article.year,
            text: ${monthName} ${article.year}
          });
        }
      }
    });
    // Process back issues data
    backIssues?.forEach(backIssue => {
      if (backIssue.display_issue) {
        const parts = backIssue.display_issue.trim().split(' ');
        if (parts.length === 2) {
          const monthName = parts[0];
          const year = parseInt(parts[1]);
          const month = monthNames.indexOf(monthName) + 1;

          if (month > 0 && !isNaN(year)) {
            const key = ${month}-${year};
            if (!issueMap.has(key)) {
              issueMap.set(key, {
                month,
                year,
                text: backIssue.display_issue
              });
            }
          }
        }
      }
    });
    // Convert map to array and sort by year (descending) and month (descending)
    return Array.from(issueMap.values()).sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year; // Most recent year first
      }
      return b.month - a.month; // Most recent month first
    });
  } catch (error) {
    console.error("Error fetching available issues:", error);
    toast.error("Failed to load available issues");
    return [];
  }
};
export const setCurrentIssue = async (issueText: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('issue')
      .update({ value: JSON.stringify(issueText) })
      .eq('key', 'display_issue');
    if (error) {
      throw new Error(error.message);
    }

    return true;
  } catch (error) {
    console.error("Error updating current issue:", error);
    toast.error("Failed to update current issue");
    return false;
  }
};

I found the issue! Looking at your code, I can see exactly what's causing the problem. The issue is in the handleIssueChange function in your Navbar component.
The Problem

When you select an archive from the dropdown, here's what happens:

    onArchiveClick is called with the selected issue (e.g., "January 2025")
    This calls handleIssueChange which updates the database with setCurrentIssue
    After 200ms, window.location.reload() is triggered
    When the page reloads, it fetches the current issue from the database
    BUT - the current issue might not have been properly updated, or there's a race condition

The Root Cause

The issue is likely in your setCurrentIssue function and how the current issue is being retrieved after the reload. Let me examine the logic:
typescript

export const setCurrentIssue = async (issueText: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('issue')
      .update({ value: JSON.stringify(issueText) })
      .eq('key', 'display_issue');
    
    if (error) {
      throw new Error(error.message);
    }
    
    return true;
  } catch (error) {
    console.error("Error updating current issue:", error);
    toast.error("Failed to update current issue");
    return false;
  }
};

The Fix

The problem is most likely one of these:
1. Race Condition with Page Reload

The setTimeout with window.location.reload() happens too quickly, before the database update completes. Try this fix:
Fixed handleIssueChange function
Code 
2. Database Table Structure Issue

I suspect there might be an issue with your issue table. Can you check:

    Is there actually a row in the issue table with key = 'display_issue'?
    Is the value column being updated correctly?

You can verify this by checking your Supabase dashboard at the table editor.
3. Alternative Fix - Remove Page Reload

Instead of reloading the entire page, you could update the state directly:
State-based solution (no page reload)
Code 
Immediate Steps to Debug:

    Check your Supabase issue table:
        Go to your Supabase dashboard
        Look at the issue table
        Verify there's a row with key = 'display_issue'
        Check what the value contains
    Add debugging logs to see exactly what's happening:

Debug version with console logs
Code 

Try the debug version first - it will show you exactly what's happening in the browser console when you select an archive.

The most likely fix is the first one I provided (with verification before reload), but the debugging will help us confirm exactly what's going wrong.

Step 1: 
I put in the new handleIssueChange function.
Step 2:
 There is that key, and its value is currently "\"September 2025\""  That is, the value starts with " then backslash then " then S

Ah! I found the problem! The issue is with the JSON encoding in your database. The value "\"September 2025\"" indicates double JSON encoding - you're storing a JSON string inside another JSON string.
The Root Cause

In your setCurrentIssue function, you're doing:
typescript

.update({ value: JSON.stringify(issueText) })

But issueText is already a plain string like "January 2025", so JSON.stringify("January 2025") becomes "\"January 2025\"" - which is a JSON-encoded string.

Then when you try to retrieve and parse it, you're getting the wrong value.
The Fix

You need to update your setCurrentIssue function to NOT use JSON.stringify:
Fixed setCurrentIssue function
Code 
Also Update Your handleIssueChange

Since we're removing the JSON encoding, also update the verification in your handleIssueChange:
Fixed handleIssueChange with correct verification
Code 
Check for Other Places Using JSON.parse

You'll also need to check anywhere else in your code that reads the current issue from the database. Look for code that does:
typescript

JSON.parse(data.value)

And change it to just:
typescript

data.value

Clean Up the Database

Since your database currently has "\"September 2025\"", you should also manually update it in Supabase:

    Go to your Supabase dashboard
    Open the issue table
    Find the row with key = 'display_issue'
    Update the value to just September 2025 (without the extra quotes and backslashes)

After making these changes, the archive selection should work correctly!

in supabase, display_issue is updating correctly, but display_year and display_month are remaining at the current issue values

Ah! That explains the behavior you're seeing. The issue is that you're only updating the display_issue field, but there are likely other parts of your application that depend on display_year and display_month fields, which aren't being updated.

When you select "January 2025" from the archives:

    display_issue gets updated to "January 2025" ✅
    display_year stays as the current year (probably 2025) ❌
    display_month stays as the current month (probably 9 for September) ❌

This mismatch is probably causing your app to briefly show the selected issue, then revert back based on the month/year fields.
The Fix

Update your setCurrentIssue function to also update the month and year fields:
Fixed setCurrentIssue function
Code ∙ Version 2 
Alternative Batch Update Approach

If you prefer a more efficient single query, you could also use this approach:
Alternative: Batch Update Approach
Code 
Update Your Verification Logic Too

You should also update the verification in your handleIssueChange to check all three fields:
Fixed handleIssueChange with correct verification
Code ∙ Version 2 

Now when you select an archive like "January 2025", it will update:

    display_issue → "January 2025"
    display_month → "1"
    display_year → "2025"

This should fix the issue where the selection was reverting back to the current issue!


const handleIssueChange = async (issueText: string) => {
  setLoading(true);
  try {
    const success = await setCurrentIssue(issueText);
    if (success) {
      toast.success(`Switched to ${issueText}`);
      
      // Wait a bit longer for the database update to propagate
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verify all issue fields were updated successfully
      const { data, error } = await supabase
        .from('issue')
        .select('key, value')
        .in('key', ['display_issue', 'display_month', 'display_year']);
      
      if (error) {
        console.error("Error verifying issue update:", error);
        toast.error("Failed to verify issue change");
        return;
      }
      
      // Check if all fields match expected values
      const issueData = data.find(item => item.key === 'display_issue');
      const monthData = data.find(item => item.key === 'display_month');
      const yearData = data.find(item => item.key === 'display_year');
      
      const parts = issueText.trim().split(' ');
      const expectedMonth = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].indexOf(parts[0]) + 1;
      const expectedYear = parseInt(parts[1]);
      
      if (issueData?.value === issueText && 
          monthData?.value === expectedMonth.toString() && 
          yearData?.value === expectedYear.toString()) {
        window.location.reload();
      } else {
        console.error("Issue update verification failed:", {
          expected: { issue: issueText, month: expectedMonth, year: expectedYear },
          actual: { 
            issue: issueData?.value, 
            month: monthData?.value, 
            year: yearData?.value 
          }
        });
        toast.error("Issue change was not saved properly");
      }
    }
  } catch (error) {
    console.error("Error changing issue:", error);
    toast.error("Failed to change issue");
  } finally {
    setLoading(false);
  }
};


  const handleArchiveClick = (archiveIssue: string | null) => {
    if (archiveIssue) {
      // Treat archives like issue changes instead of opening URLs
      handleIssueChange(archiveIssue);
    } else {
      toast.warning("No issue information available for this archive");
    }
  };

  useEffect(() => {
    const fetchBackIssues = async () => {
      setLoadingArchives(true);
      try {
        const { data, error } = await supabase
          .from('back_issues')
          .select('id, display_issue, url')
          .order('id', { ascending: false });

        if (error) throw error;
        setBackIssues(data || []);
      } catch (error) {
        console.error("Error fetching back issues:", error);
        toast.error("Failed to load archives");
      } finally {
        setLoadingArchives(false);
      }
    };

    fetchBackIssues();
  }, []); // Removed the user dependency to load archives for all users

  return (
    <nav className="border-b shadow-sm py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link 
            to="/" 
            className="text-2xl font-bold text-primary flex items-center gap-2"
            onClick={handleLogoClick}
          >
            The Klatsch
            {currentIssue && (
              <IssueSelector 
                currentIssue={currentIssue}
                issues={issues}
                loading={loading}
                onIssueChange={handleIssueChange}
              />
            )}
          </Link>
          
          {/* Removed the user condition to show archives to all users */}
          <ArchivesMenu
            backIssues={backIssues}
            loadingArchives={loadingArchives}
            onArchiveClick={handleArchiveClick}
          />
        </div>
        
        <div className="flex items-center gap-4">
          {onSearch && onClearSearch && (
            <div className={`${user ? 'flex-1 max-w-lg' : 'max-w-md'}`}>
              <SearchBar
                onSearch={onSearch}
                onClear={onClearSearch}
                currentQuery={searchQuery}
                placeholder="Search articles..."
              />
            </div>
          )}
          {showReadFilter && user && onFilterToggle && (
            <ReadFilter 
              enabled={filterEnabled} 
              onToggle={onFilterToggle}
            />
          )}
          {user ? (
            <>
              <Button asChild variant="default">
                <Link to="/create" className="flex items-center gap-2">
                  <PenLine size={18} />
                  Write Article
                </Link>
              </Button>
              
              <UserMenu
                profile={profile}
                userEmail={user.email}
                getUserInitials={getUserInitials}
                signOut={signOut}
              />
            </>
          ) : (
            <Button asChild variant="default">
              <Link to="/auth" className="flex items-center gap-2">
                <LogIn size={18} />
                Sign In
              </Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
