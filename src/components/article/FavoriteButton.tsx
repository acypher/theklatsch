import { Heart } from "lucide-react";
import { useArticleFavorites } from "@/hooks/useArticleFavorites";
import { useAuth } from "@/contexts/AuthContext";

interface FavoriteButtonProps {
  articleId: string;
}

const FavoriteButton = ({ articleId }: FavoriteButtonProps) => {
  const { isAuthenticated } = useAuth();
  const { isFavorite, loading, toggleFavorite } = useArticleFavorites(articleId);

  if (!isAuthenticated) return null;

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite();
      }}
      disabled={loading}
      className="absolute top-10 right-2 z-10 w-6 h-6 flex items-center justify-center transition-colors"
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart 
        className={`h-5 w-5 transition-all ${
          isFavorite 
            ? 'fill-red-500 text-red-500' 
            : 'text-muted-foreground hover:text-red-400'
        }`}
      />
    </button>
  );
};

export default FavoriteButton;
