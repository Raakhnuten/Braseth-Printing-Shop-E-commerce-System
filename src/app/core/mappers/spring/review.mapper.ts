import { Review, ReviewStatus } from '../../models/review.model';
import { ReviewResponseDto, CreateReviewRequestDto } from '../../models/dto/review.dto';

export function mapReviewDtoToReview(dto: ReviewResponseDto): Review {
  return {
    id: dto.id,
    productId: dto.productId,
    productName: dto.productName,
    userId: dto.userId,
    userName: dto.userName,
    rating: dto.rating,
    title: dto.title,
    comment: dto.comment,
    images: dto.images,
    verifiedPurchase: dto.verifiedPurchase,
    helpfulCount: dto.helpfulCount,
    status: dto.status as ReviewStatus,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export function mapCreateReviewToDto(review: Partial<Review>): CreateReviewRequestDto {
  return {
    productId: review.productId || '',
    rating: review.rating || 5,
    title: review.title || '',
    comment: review.comment || '',
    images: review.images || [],
  };
}
