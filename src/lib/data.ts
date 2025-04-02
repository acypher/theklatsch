
import { Article } from './types';

// Default example articles
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

const STORAGE_KEY = 'myFriendsArticles';

// Function to load articles from localStorage
const loadArticles = (): Article[] => {
  try {
    const storedArticles = localStorage.getItem(STORAGE_KEY);
    if (storedArticles) {
      return JSON.parse(storedArticles);
    }
    // If no stored articles, save and return the default ones
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ARTICLES));
    return DEFAULT_ARTICLES;
  } catch (error) {
    console.error("Failed to load articles from localStorage:", error);
    return DEFAULT_ARTICLES;
  }
};

// Initialize articles from localStorage
let articles: Article[] = loadArticles();

// Function to save articles to localStorage
const saveArticles = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
  } catch (error) {
    console.error("Failed to save articles to localStorage:", error);
  }
};

// Function to get all articles
export const getAllArticles = (): Article[] => {
  return [...articles].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

// Function to get article by ID
export const getArticleById = (id: string): Article | undefined => {
  return articles.find(article => article.id === id);
};

// Function to add a new article
export const addArticle = (article: Omit<Article, 'id' | 'createdAt'>): Article => {
  // Generate a unique ID (using timestamp + random to ensure uniqueness)
  const newId = new Date().getTime() + '-' + Math.random().toString(36).substring(2, 9);
  
  const newArticle = {
    ...article,
    id: newId,
    createdAt: new Date().toISOString()
  };
  
  articles.push(newArticle);
  
  // Save to localStorage
  saveArticles();
  
  return newArticle;
};

// Function to get articles by keyword
export const getArticlesByKeyword = (keyword: string): Article[] => {
  return articles.filter(article => 
    article.keywords.some(k => k.toLowerCase() === keyword.toLowerCase())
  );
};
