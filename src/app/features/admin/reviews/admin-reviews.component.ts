import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, LowerCasePipe } from '@angular/common';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ReviewService } from '../../../core/services/review.service';
import { Review, ReviewStatus } from '../../../core/models/review.model';

@Component({
  selector: 'app-admin-reviews',
  templateUrl: './admin-reviews.component.html',
  styleUrl: './admin-reviews.component.scss',
  imports: [PageHeaderComponent, LoadingSpinnerComponent, EmptyStateComponent, DatePipe, LowerCasePipe],
})
export class AdminReviewsComponent implements OnInit {
  private reviewService = inject(ReviewService);
  private destroyRef = inject(DestroyRef);

  pageTitle = 'Manage Reviews';
  loading = signal(false);
  error = signal('');
  reviews = signal<Review[]>([]);
  successMessage = signal('');

  showConfirm = signal(false);
  confirmTitle = signal('');
  confirmMessage = signal('');
  confirmButtonText = signal('');
  pendingAction: (() => void) | null = null;

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.loading.set(true);
    this.error.set('');
    this.reviewService.getReviews().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.reviews.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load reviews');
        this.loading.set(false);
      },
    });
  }

  approveReview(id: string): void {
    this.confirmTitle.set('Approve Review');
    this.confirmMessage.set('Are you sure you want to approve this review?');
    this.confirmButtonText.set('Approve');
    this.pendingAction = () => {
      this.reviewService.updateReview(id, { status: ReviewStatus.APPROVED }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.closeConfirm();
          this.successMessage.set('Review approved successfully');
          this.clearMessage();
          this.loadReviews();
        },
        error: () => {
          this.closeConfirm();
          this.error.set('Failed to approve review');
        },
      });
    };
    this.showConfirm.set(true);
  }

  rejectReview(id: string): void {
    this.confirmTitle.set('Reject Review');
    this.confirmMessage.set('Are you sure you want to reject this review?');
    this.confirmButtonText.set('Reject');
    this.pendingAction = () => {
      this.reviewService.updateReview(id, { status: ReviewStatus.REJECTED }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.closeConfirm();
          this.successMessage.set('Review rejected successfully');
          this.clearMessage();
          this.loadReviews();
        },
        error: () => {
          this.closeConfirm();
          this.error.set('Failed to reject review');
        },
      });
    };
    this.showConfirm.set(true);
  }

  deleteReview(id: string): void {
    this.confirmTitle.set('Delete Review');
    this.confirmMessage.set('Are you sure you want to delete this review?');
    this.confirmButtonText.set('Delete');
    this.pendingAction = () => {
      this.reviewService.deleteReview(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.closeConfirm();
          this.successMessage.set('Review deleted successfully');
          this.clearMessage();
          this.loadReviews();
        },
        error: () => {
          this.closeConfirm();
          this.error.set('Failed to delete review');
        },
      });
    };
    this.showConfirm.set(true);
  }

  confirmAction(): void {
    if (this.pendingAction) {
      this.pendingAction();
    }
  }

  closeConfirm(): void {
    this.showConfirm.set(false);
    this.pendingAction = null;
  }

  clearMessage(): void {
    setTimeout(() => this.successMessage.set(''), 3000);
  }

  ratingStars(rating: number): string {
    return '\u2605'.repeat(rating) + '\u2606'.repeat(5 - rating);
  }

  truncate(text: string, max: number): string {
    return text.length > max ? text.slice(0, max) + '...' : text;
  }
}
