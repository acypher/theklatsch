import { Article } from "./types";

export interface SearchOptions {
  searchTitle?: boolean;
  searchContent?: boolean;
  searchKeywords?: boolean;
  searchAuthor?: boolean;
  caseSensitive?: boolean;
}

export const defaultSearchOptions: SearchOptions = {
  searchTitle: true,
  searchContent: true,
  searchKeywords: true,
  searchAuthor: true,
  caseSensitive: false,
};

export function searchArticles(
  articles: Article[],
  query: string,
  options: SearchOptions = defaultSearchOptions
): Article[] {
  if (!query.trim()) {
    return articles;
  }

  const searchTerm = options.caseSensitive ? query : query.toLowerCase();
  const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 0);

  // Filter out private articles from search results
  return articles.filter(article => {
    // Exclude private articles from search
    if (article.private) {
      return false;
    }

    const searchableText = [
      options.searchTitle ? article.title : "",
      options.searchContent ? article.description : "",
      options.searchContent && article.more_content ? article.more_content : "",
      options.searchAuthor ? article.author : "",
      options.searchKeywords ? article.keywords.join(" ") : "",
    ]
      .join(" ")
      .toLowerCase();

    // Check if all search words are found in the searchable text
    return searchWords.every(word => 
      searchableText.includes(options.caseSensitive ? word : word.toLowerCase())
    );
  });
}

export function isVideoUrl(url: string): boolean {
  const videoPatterns = [
    /youtube\.com\/watch\?v=|youtu\.be\//,
    /vimeo\.com\/\d+/,
    /\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv)$/i,
    /twitch\.tv\/videos\//,
    /dailymotion\.com\/video\//,
  ];

  return videoPatterns.some(pattern => pattern.test(url));
}

export function extractVideoInfo(url: string) {
  // YouTube patterns
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  
  if (youtubeMatch) {
    return {
      platform: 'youtube',
      id: youtubeMatch[1],
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
      thumbnailUrl: `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`
    };
  }

  // Vimeo patterns
  const vimeoRegex = /(?:vimeo\.com\/)([0-9]+)/;
  const vimeoMatch = url.match(vimeoRegex);
  
  if (vimeoMatch) {
    return {
      platform: 'vimeo',
      id: vimeoMatch[1],
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      thumbnailUrl: `https://vumbnail.com/${vimeoMatch[1]}.jpg`
    };
  }

  // Generic video files
  if (url.match(/\.(mp4|webm|ogg)$/i)) {
    return {
      platform: 'video',
      id: '',
      embedUrl: url,
      thumbnailUrl: null
    };
  }

  return null;
}