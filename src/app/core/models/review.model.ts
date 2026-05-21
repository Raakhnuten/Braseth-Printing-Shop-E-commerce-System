export interface Review {
  id: string;
  productId: string;
  productName: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  verifiedPurchase: boolean;
  helpfulCount: number;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
}

export enum ReviewStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}