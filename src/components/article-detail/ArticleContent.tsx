
import React from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Separator } from "@/components/ui/separator";

interface ArticleContentProps {
  description: string;
  moreContent?: string | null;
}

const ArticleContent = ({ description, moreContent }: ArticleContentProps) => {
  return (
    <div className="prose prose-lg max-w-none mb-8">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {description}
      </ReactMarkdown>
      
      {moreContent && (
        <div className="mt-8 pt-8 border-t">
          <h2 className="text-2xl font-bold mb-4">More Information</h2>
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {moreContent}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleContent;
