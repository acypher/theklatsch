
export const getImageUrl = (url: string): string => {
  if (url.includes('drive.google.com/file/d/')) {
    const fileIdMatch = url.match(/\/d\/([^/]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      const fileId = fileIdMatch[1];
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
  }
  return url;
};
