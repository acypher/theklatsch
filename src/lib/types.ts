
export interface Article {
  id: string;
  title: string;
  description: string;
  author: string;
  keywords: string[];
  imageUrl: string;
  sourceUrl: string;
  createdAt: string;
  summary?: string | null;
  more_content?: string | null;
  deleted?: boolean;
  deletedAt?: string | null;
  displayPosition?: number | null;
  updatedAt?: string;
}
