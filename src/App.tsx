
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CommentViewProvider } from "@/contexts/CommentViewContext";
import Index from "./pages/Index";
import CreateArticle from "./pages/CreateArticle";
import ArticleView from "./pages/ArticleView";
import EditArticle from "./pages/EditArticle";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import ImageDisplay from "./pages/ImageDisplay";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <CommentViewProvider>
            <Toaster />
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<Index />} />
              <Route
                path="/create"
                element={
                  <ProtectedRoute>
                    <CreateArticle />
                  </ProtectedRoute>
                }
              />
              <Route path="/article/:id" element={<ArticleView />} />
              <Route
                path="/article/:id/edit"
                element={
                  <ProtectedRoute>
                    <EditArticle />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route path="/image" element={<ImageDisplay />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CommentViewProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
