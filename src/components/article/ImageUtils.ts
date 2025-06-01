
export const getImageUrl = (url: string): string => {
  // If URL is empty, contains unsplash reference, or is invalid, use default
  if (!url || url.includes('images.unsplash.com') || url.trim() === '') {
    return "https://kjfwyaniengzduyeeufq.supabase.co/storage/v1/object/public/logos/defaultImage.png";
  }
  
  if (url.includes('drive.google.com/file/d/')) {
    const fileIdMatch = url.match(/\/d\/([^/]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      const fileId = fileIdMatch[1];
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
  }
  return url;
};
