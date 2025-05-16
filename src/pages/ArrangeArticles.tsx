
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Loader2 } from "lucide-react";
import ArticleArrangeList from "@/components/ArticleArrangeList";

const ArrangeArticles = () => {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleCloseSheet = () => {
    setOpen(false);
    // Navigate back to home page
    window.location.href = "/";
  };

  return (
    <div>
      <Navbar />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent 
          className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl" 
          onCloseAutoFocus={handleCloseSheet}
        >
          <SheetHeader>
            <SheetTitle>Arrange Articles</SheetTitle>
            <SheetDescription>
              Drag and drop articles to change their display order
            </SheetDescription>
          </SheetHeader>
          
          <ScrollArea 
            className="h-[calc(100vh-200px)] mt-4 pr-4" 
            id="articles-scroll-area"
          >
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading articles...</span>
              </div>
            ) : (
              <ArticleArrangeList />
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ArrangeArticles;
