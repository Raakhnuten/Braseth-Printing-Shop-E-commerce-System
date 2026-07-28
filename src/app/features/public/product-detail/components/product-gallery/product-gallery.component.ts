import { Component, ChangeDetectionStrategy, Input, signal } from '@angular/core';
import { normalizeImages, getSafeImageUrl, onImageError } from '../../../../../core/helpers/image.helper';

@Component({
  selector: 'app-product-gallery',
  templateUrl: './product-gallery.component.html',
  styleUrl: './product-gallery.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductGalleryComponent {
  @Input() images: string[] = [];
  @Input() thumbnailUrl: string = '';
  @Input() productName: string = '';

  selectedImageIndex = 0;
  zoomed = signal(false);

  get validImages(): string[] {
    const cleaned = normalizeImages(this.images);
    const all = [getSafeImageUrl(this.thumbnailUrl), ...cleaned];
    return [...new Set(all)];
  }

  onImgError(event: Event): void {
    onImageError(event);
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }
}
