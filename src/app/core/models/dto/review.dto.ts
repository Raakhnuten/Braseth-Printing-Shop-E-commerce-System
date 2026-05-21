export interface ReviewResponseDto {
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
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequestDto {
  productId: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
}

export interface UpdateReviewRequestDto {
  title?: string;
  comment?: string;
  rating?: number;
  status?: string;
  images?: string[];
}
