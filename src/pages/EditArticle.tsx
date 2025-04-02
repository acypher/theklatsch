
import Navbar from "@/components/Navbar";
import EditArticleForm from "@/components/EditArticleForm";

const EditArticle = () => {
  return (
    <div>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Edit Article</h1>
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
