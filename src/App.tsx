
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
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

const RootLayout = () => (
  <AuthProvider>
    <Toaster />
    <Outlet />
  </AuthProvider>
);

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/auth", element: <Auth /> },
      { path: "/", element: <Index /> },
      {
        path: "/create",
        element: (
          <ProtectedRoute>
            <CreateArticle />
          </ProtectedRoute>
        ),
      },
      { path: "/article/:id", element: <ArticleView /> },
      {
        path: "/article/:id/edit",
        element: (
          <ProtectedRoute>
            <EditArticle />
          </ProtectedRoute>
        ),
      },
      {
        path: "/profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      { path: "/image", element: <ImageDisplay /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <RouterProvider router={router} />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
