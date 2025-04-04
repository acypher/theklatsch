
import React from "react";

const ArticleDetailLoading = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-secondary rounded w-3/4"></div>
        <div className="h-4 bg-secondary rounded w-1/4"></div>
        <div className="h-64 bg-secondary rounded"></div>
        <div className="space-y-2">
          <div className="h-4 bg-secondary rounded"></div>
          <div className="h-4 bg-secondary rounded"></div>
          <div className="h-4 bg-secondary rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetailLoading;
