import React, { useState } from "react";
import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateLatestIssue } from "@/lib/data/issue/latestIssue";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear + i - 1);

interface AdvanceIssueDialogProps {
  currentIssue: string;
}

const AdvanceIssueDialog = ({ currentIssue }: AdvanceIssueDialogProps) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Parse current issue to suggest next month
  const getNextMonth = () => {
    const parts = currentIssue.trim().split(" ");
    if (parts.length === 2) {
      const monthIndex = MONTHS.indexOf(parts[0]);
      const year = parseInt(parts[1]);
      if (monthIndex >= 0 && !isNaN(year)) {
        const nextMonth = (monthIndex + 1) % 12;
        const nextYear = monthIndex === 11 ? year + 1 : year;
        return { month: nextMonth + 1, year: nextYear };
      }
    }
    return { month: new Date().getMonth() + 1, year: currentYear };
  };

  const next = getNextMonth();
  const [selectedMonth, setSelectedMonth] = useState(next.month.toString());
  const [selectedYear, setSelectedYear] = useState(next.year.toString());

  const handleAdvance = async () => {
    setSaving(true);
    const success = await updateLatestIssue(
      parseInt(selectedMonth),
      parseInt(selectedYear)
    );
    setSaving(false);
    if (success) {
      setOpen(false);
      // Clear user selection so they land on the new issue
      localStorage.removeItem("selected_issue");
      localStorage.removeItem("selected_issue_v2");
      setTimeout(() => window.location.reload(), 300);
    }
  };

  const previewIssue = `${MONTHS[parseInt(selectedMonth) - 1]} ${selectedYear}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <CalendarPlus className="h-5 w-5" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Advance to next issue</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Advance to New Issue</DialogTitle>
          <DialogDescription>
            Set the month and year for the next issue. New articles will be created under this issue.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-4 py-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Month</label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m, i) => (
                  <SelectItem key={m} value={(i + 1).toString()}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Year</label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          New issue will be: <strong>{previewIssue}</strong>
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdvance} disabled={saving}>
            {saving ? "Saving..." : "Advance Issue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdvanceIssueDialog;
