import { Component, ChangeDetectionStrategy, Input, OnChanges, signal } from '@angular/core';
import { normalizeImages, getSafeImageUrl, onImageError } from '../../../../../core/helpers/image.helper';

@Component({
  selector: 'app-product-gallery',
  templateUrl: './product-gallery.component.html',
  styleUrl: './product-gallery.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductGalleryComponent implements OnChanges {
  @Input() images: string[] = [];
  @Input() thumbnailUrl: string = '';
  @Input() productName: string = '';

  selectedImageIndex = 0;
  zoomed = signal(false);

  private _validImages: string[] = [];

  get validImages(): string[] {
    return this._validImages;
  }

  ngOnChanges(): void {
    const cleaned = normalizeImages(this.images);
    const all = [getSafeImageUrl(this.thumbnailUrl), ...cleaned];
    this._validImages = [...new Set(all)];
  }

  onImgError(event: Event): void {
    onImageError(event);
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }
}
