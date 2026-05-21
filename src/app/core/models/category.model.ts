export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  enabled: boolean;
  sortOrder: number;
  parentId: string | null;
  parentName: string | null;
  childIds: string[];
}