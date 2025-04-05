
"use client"

import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PenLine, LogOut, LogIn, MoveHorizontal, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentMonth, setCurrentMonth] = useState<number | null>(null);
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const [yearOptions, setYearOptions] = useState<number[]>([]);
  const [monthOptions] = useState<{ value: number; label: string }[]>([
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ]);
  
  useEffect(() => {
    const fetchCurrentSettings = async () => {
      try {
        const { data: yearData, error: yearError } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'current_year')
          .single();

        const { data: monthData, error: monthError } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'current_month')
          .single();

        if (yearError || monthError) {
          console.error('Error fetching settings:', yearError || monthError);
          return;
        }

        if (yearData && monthData) {
          setCurrentYear(Number(yearData.value));
          setCurrentMonth(Number(monthData.value));
          
          // Generate year options (current year and 2 years before/after)
          const currentYearValue = Number(yearData.value);
          setYearOptions([
            currentYearValue - 2,
            currentYearValue - 1,
            currentYearValue,
            currentYearValue + 1,
            currentYearValue + 2
          ]);
        }
      } catch (error) {
        console.error('Error fetching current settings:', error);
      }
    };

    fetchCurrentSettings();
  }, []);
  
  const getUserInitials = () => {
    if (!user) return "?";
    const email = user.email || "";
    return email.substring(0, 2).toUpperCase();
  };

  const getFormattedMonth = () => {
    if (!currentMonth) return "";
    return monthOptions.find(m => m.value === currentMonth)?.label || "";
  };

  return (
    <nav className="border-b shadow-sm py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link to="/" className="text-2xl font-bold text-primary">The Klatsch</Link>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="text-2xl font-bold text-primary p-0 h-auto flex items-center gap-1">
                <ChevronDown size={20} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-3" align="start">
              <div className="space-y-3">
                {currentMonth && currentYear && (
                  <div className="text-sm text-muted-foreground mb-2">
                    Current Issue: {getFormattedMonth()} {currentYear}
                  </div>
                )}
                
                <div className="grid gap-2">
                  <div className="grid gap-1">
                    <label htmlFor="month" className="text-sm font-medium">Month</label>
                    <Select
                      disabled={!user}
                      value={currentMonth?.toString()}
                      onValueChange={async (value) => {
                        if (user) {
                          const { error } = await supabase
                            .from('settings')
                            .update({ value })
                            .eq('key', 'current_month');
                            
                          if (!error) {
                            setCurrentMonth(Number(value));
                          }
                        }
                      }}
                    >
                      <SelectTrigger id="month">
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {monthOptions.map((month) => (
                          <SelectItem key={month.value} value={month.value.toString()}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-1">
                    <label htmlFor="year" className="text-sm font-medium">Year</label>
                    <Select
                      disabled={!user}
                      value={currentYear?.toString()}
                      onValueChange={async (value) => {
                        if (user) {
                          const { error } = await supabase
                            .from('settings')
                            .update({ value })
                            .eq('key', 'current_year');
                            
                          if (!error) {
                            setCurrentYear(Number(value));
                          }
                        }
                      }}
                    >
                      <SelectTrigger id="year">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {yearOptions.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {!user && (
                  <p className="text-xs text-muted-foreground mt-2">You must be signed in to change settings</p>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Button asChild variant="outline">
                <Link to="/?mode=arrange" className="flex items-center gap-2">
                  <MoveHorizontal size={18} />
                  Arrange
                </Link>
              </Button>
              
              <Button asChild variant="default">
                <Link to="/create" className="flex items-center gap-2">
                  <PenLine size={18} />
                  Write Article
                </Link>
              </Button>
              
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Avatar className="h-8 w-8 cursor-pointer">
                        <AvatarFallback>{getUserInitials()}</AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{user.email}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <Button variant="ghost" size="icon" onClick={signOut}>
                  <LogOut size={18} />
                </Button>
              </div>
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
