import { Article } from "./types";

export interface SearchOptions {
  searchTitle?: boolean;
  searchContent?: boolean;
  searchKeywords?: boolean;
  searchAuthor?: boolean;
  caseSensitive?: boolean;
  wholeWords?: boolean;
}

export const defaultSearchOptions: SearchOptions = {
  searchTitle: true,
  searchContent: true,
  searchKeywords: true,
  searchAuthor: true,
  caseSensitive: false,
  wholeWords: false,
};

export function searchArticles(
  articles: Article[],
  query: string,
  options: SearchOptions = defaultSearchOptions
): Article[] {
  if (!query.trim()) {
    return articles;
  }

  // Check for keyword-only search (key:xxx syntax)
  const keywordMatch = query.match(/^key:(.+)$/i);
  if (keywordMatch) {
    const keywordQuery = keywordMatch[1].trim();
    const keywordSearch = options.caseSensitive ? keywordQuery : keywordQuery.toLowerCase();
    
    return articles.filter(article => {
      if (article.private) return false;
      
      return article.keywords.some(keyword => {
        const kw = options.caseSensitive ? keyword : keyword.toLowerCase();
        if (options.wholeWords) {
          return kw === keywordSearch;
        }
        return kw.includes(keywordSearch);
      });
    });
  }

  // Extract quoted phrases and regular words
  const phrases: string[] = [];
  const regularWords: string[] = [];
  
  const phraseRegex = /"([^"]+)"/g;
  let match;
  let remainingQuery = query;
  
  while ((match = phraseRegex.exec(query)) !== null) {
    phrases.push(match[1]);
    remainingQuery = remainingQuery.replace(match[0], '');
  }
  
  // Split remaining query into words
  const words = remainingQuery.trim().split(/\s+/).filter(word => word.length > 0);
  regularWords.push(...words);

  // Filter out private articles from search results
  return articles.filter(article => {
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

    // Check all quoted phrases match
    const phrasesMatch = phrases.every(phrase => {
      const searchPhrase = options.caseSensitive ? phrase : phrase.toLowerCase();
      return searchableText.includes(searchPhrase);
    });

    if (!phrasesMatch) return false;

    // Check all regular words match
    const wordsMatch = regularWords.every(word => {
      const searchWord = options.caseSensitive ? word : word.toLowerCase();
      
      if (options.wholeWords) {
        // Use word boundary regex for whole word matching
        const wordBoundaryRegex = new RegExp(`\\b${searchWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, options.caseSensitive ? '' : 'i');
        return wordBoundaryRegex.test(searchableText);
      }
      
      return searchableText.includes(searchWord);
    });

    return wordsMatch;
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