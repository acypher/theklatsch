
import Navbar from "@/components/Navbar";
import EditArticleForm from "@/components/EditArticleForm";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getArticleById } from "@/lib/data";
import { Article } from "@/lib/types";

const EditArticle = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      if (id) {
        const fetchedArticle = await getArticleById(id);
        setArticle(fetchedArticle);
      }
    };
    fetchArticle();
  }, [id]);

  return (
    <div>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className={`text-3xl font-bold mb-2 ${article?.private ? 'border border-red-600 p-2 rounded inline-block' : ''}`}>
            Edit Article
          </h1>
          <p className="text-muted-foreground mb-8">
            Update your article details below.
          </p>
          <EditArticleForm />
        </div>
      </main>
    </div>
  );
};

export default EditArticle;
