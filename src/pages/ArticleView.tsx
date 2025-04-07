
import Navbar from "@/components/Navbar";
import ArticleDetail from "@/components/ArticleDetail";

const ArticleView = () => {
  return (
    <div>
      <Navbar />
      <main className="prose prose-lg max-w-none pb-12 markdown-content-container">
        <ArticleDetail />
      </main>
      
      {/* Add styles to properly isolate markdown content */}
      <style jsx>{`
        .markdown-content-container {
          isolation: isolate;
        }
      `}</style>
    </div>
  );
};

export default ArticleView;
