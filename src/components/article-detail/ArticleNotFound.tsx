
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ArticleNotFound = () => {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h2 className="text-2xl font-bold mb-4">Article not found</h2>
      <Button asChild>
        <Link to="/">Return to Home</Link>
      </Button>
    </div>
  );
};

export default ArticleNotFound;
