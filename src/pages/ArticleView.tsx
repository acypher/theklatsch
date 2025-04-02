
import Navbar from "@/components/Navbar";
import ArticleDetail from "@/components/ArticleDetail";

const ArticleView = () => {
  return (
    <div>
      <Navbar />
      <main className="prose prose-lg max-w-none">
        <ArticleDetail />
      </main>
    </div>
  );
};

export default ArticleView;
