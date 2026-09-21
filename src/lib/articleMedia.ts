// Keep uploaded extensions predictable so saved URLs identify the media type.
export const ARTICLE_MEDIA_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/ogg': 'ogv',
  'video/quicktime': 'mov',
};

export const isArticleVideo = (url: string): boolean =>
  /\.(mp4|webm|ogv|ogg|mov|m4v)(?:[?#]|$)/i.test(url.trim());

export const getArticleMediaError = (file: File): string | null => {
  if (!ARTICLE_MEDIA_TYPES[file.type]) {
    return 'Choose a JPEG, PNG, GIF, WebP, MP4, WebM, Ogg, or MOV file.';
  }
  const limitMB = file.type.startsWith('video/') ? 50 : 5;
  return file.size > limitMB * 1024 * 1024
    ? `File size exceeds ${limitMB}MB limit`
    : null;
};
