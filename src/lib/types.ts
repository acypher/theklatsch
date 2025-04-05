
export interface Article {
  id: string;
  title: string;
  description: string;
  author: string;
  keywords: string[];
  imageUrl: string;
  sourceUrl: string;
  createdAt: string;
  more_content?: string | null;
  deleted?: boolean;
  deletedAt?: string | null;
  year?: number | null;
  month?: number | null;
}

export interface Issue {
  id: string;
  month: number;
  year: number;
  created_at: string;
}
