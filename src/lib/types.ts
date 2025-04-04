
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
  month?: number;
  year?: number;
}

export interface Setting {
  id: string;
  key: string;
  value: any;
  createdAt: string;
  updatedAt: string;
}

export interface CurrentIssue {
  month: number;
  year: number;
}
