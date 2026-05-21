export interface PlatziProduct {
  id: number;
  title: string;
  price: number;
  description: string;
  images: string[];
  category: PlatziCategoryRef;
  creationAt: string;
  updatedAt: string;
}

export interface PlatziCategoryRef {
  id: number;
  name: string;
  image: string;
  creationAt: string;
  updatedAt: string;
}
