import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  templateUrl: './skeleton-loader.component.html',
  styleUrl: './skeleton-loader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class SkeletonLoaderComponent {
  readonly type = input<'card' | 'text' | 'image'>('card');
  readonly count = input<number>(1);

  get items(): number[] {
    return Array.from({ length: this.count() }, (_, i) => i);
  }
}
