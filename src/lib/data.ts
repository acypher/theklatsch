
import { Article } from './types';
import { toast } from "sonner";

// Default example articles that will be used until connected to a backend
const DEFAULT_ARTICLES: Article[] = [
  {
    id: "1",
    title: "The Future of Web Development",
    description: "Exploring the latest trends and technologies shaping the future of web development.",
    author: "Sarah Johnson",
    keywords: ["Web Development", "JavaScript", "Future Tech"],
    imageUrl: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
    sourceUrl: "https://example.com/web-dev-future",
    createdAt: "2023-06-15T10:30:00Z"
  },
  {
    id: "2",
    title: "Machine Learning Basics",
    description: "A beginner-friendly introduction to machine learning concepts and applications.",
    author: "Michael Chen",
    keywords: ["Machine Learning", "AI", "Data Science"],
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    sourceUrl: "https://example.com/ml-basics",
    createdAt: "2023-05-22T14:20:00Z"
  },
  {
    id: "3",
    title: "Sustainable Living Tips",
    description: "Practical tips for adopting a more environmentally friendly lifestyle.",
    author: "Emma Wilson",
    keywords: ["Sustainability", "Environment", "Lifestyle"],
    imageUrl: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    sourceUrl: "https://example.com/sustainable-living",
    createdAt: "2023-07-08T09:15:00Z"
  },
  {
    id: "4",
    title: "Financial Independence Guide",
    description: "Strategies and advice for achieving financial freedom and security.",
    author: "David Brown",
    keywords: ["Finance", "Investment", "Money Management"],
    imageUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
    sourceUrl: "https://example.com/financial-independence",
    createdAt: "2023-04-30T16:45:00Z"
  },
  {
    id: "5",
    title: "Digital Art Techniques",
    description: "Creative approaches and tools for digital artists of all skill levels.",
    author: "Lisa Park",
    keywords: ["Digital Art", "Creativity", "Design"],
    imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    sourceUrl: "https://example.com/digital-art",
    createdAt: "2023-07-01T11:00:00Z"
  }
];

// SessionStorage key for articles
const ARTICLES_STORAGE_KEY = 'myFriendsArticles';

// Get initial articles from sessionStorage or use defaults
const getInitialArticles = (): Article[] => {
  try {
    const savedArticles = sessionStorage.getItem(ARTICLES_STORAGE_KEY);
    if (savedArticles) {
      return JSON.parse(savedArticles);
    }
  } catch (error) {
    console.error('Error loading articles from sessionStorage:', error);
  }
  return [...DEFAULT_ARTICLES];
};

// In-memory cache of articles
let articlesCache: Article[] | null = null;

// Function to save articles to sessionStorage
const saveArticlesToStorage = (articles: Article[]) => {
  try {
    sessionStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(articles));
  } catch (error) {
    console.error('Error saving articles to sessionStorage:', error);
  }
};

// Function to handle API errors
const handleApiError = (error: unknown) => {
  console.error("API Error:", error);
  toast.error("Failed to connect to the articles backend. Using default data.");
  return getInitialArticles();
};

// Function to fetch all articles from the backend
export const getAllArticles = async (): Promise<Article[]> => {
  // If we have cached articles, return them
  if (articlesCache) {
    return [...articlesCache].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  try {
    // Simulated API response with stored data
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    articlesCache = getInitialArticles();
    
    return [...articlesCache].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  } catch (error) {
    return handleApiError(error);
  }
};

// Function to get article by ID
export const getArticleById = async (id: string): Promise<Article | undefined> => {
  try {
    // If we have cached articles, try to find it there first
    if (articlesCache) {
      const cachedArticle = articlesCache.find(article => article.id === id);
      if (cachedArticle) return cachedArticle;
    }

    // If not in cache, load all articles and try again
    const allArticles = await getAllArticles();
    return allArticles.find(article => article.id === id);
  } catch (error) {
    console.error(`Error fetching article ${id}:`, error);
    return undefined;
  }
};

// Function to add a new article to the backend
export const addArticle = async (article: Omit<Article, 'id' | 'createdAt'>): Promise<Article> => {
  try {
    // Generate a unique ID (using timestamp + random to ensure uniqueness)
    const newId = new Date().getTime() + '-' + Math.random().toString(36).substring(2, 9);
    
    const newArticle = {
      ...article,
      id: newId,
      createdAt: new Date().toISOString()
    };
    
    // Simulate API response
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
    
    // Update our cache with the new article
    if (articlesCache) {
      articlesCache = [...articlesCache, newArticle];
    } else {
      const allArticles = await getAllArticles();
      articlesCache = [...allArticles, newArticle];
    }
    
    // Save to sessionStorage
    saveArticlesToStorage(articlesCache);
    
    return newArticle;
  } catch (error) {
    console.error("Error adding article:", error);
    throw new Error("Failed to add article to the backend");
  }
};

// Function to get articles by keyword
export const getArticlesByKeyword = async (keyword: string): Promise<Article[]> => {
  try {
    // Get all articles first (this will use the cache if available)
    const allArticles = await getAllArticles();
    
    // Filter by keyword
    return allArticles.filter(article => 
      article.keywords.some(k => k.toLowerCase() === keyword.toLowerCase())
    );
  } catch (error) {
    return handleApiError(error);
  }
};
