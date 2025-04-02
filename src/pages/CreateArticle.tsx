
import Navbar from "@/components/Navbar";
import CreateArticleForm from "@/components/CreateArticleForm";

const CreateArticle = () => {
  return (
    <div>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Create a New Article</h1>
          <p className="text-muted-foreground mb-8">
            Share your thoughts, ideas, or experiences with your friends.
          </p>
          <CreateArticleForm />
        </div>
      </main>
    </div>
  );
};

export default CreateArticle;
