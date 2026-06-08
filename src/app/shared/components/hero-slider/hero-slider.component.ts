import { Component, Input, signal, effect, HostListener, DestroyRef, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Banner } from '../../../core/models/banner.model';

@Component({
  selector: 'app-hero-slider',
  templateUrl: './hero-slider.component.html',
  styleUrl: './hero-slider.component.scss',
  imports: [RouterLink],
})
export class HeroSliderComponent {
  private destroyRef = inject(DestroyRef);

  @Input({ required: true }) banners: Banner[] = [];
  @Input() autoplayInterval = 5000;
  @Input() showDots = true;
  @Input() showArrows = true;

  currentIndex = signal(0);
  isPaused = signal(false);
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    effect(() => {
      const banners = this.banners;
      const paused = this.isPaused();
      this.clearTimer();
      if (banners.length > 1 && !paused) {
        this.startTimer();
      }
    });
  }

  private startTimer(): void {
    this.timer = setInterval(() => {
      this.next();
    }, this.autoplayInterval);
    this.destroyRef.onDestroy(() => this.clearTimer());
  }

  private clearTimer(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  goTo(index: number): void {
    this.currentIndex.set(index);
  }

  next(): void {
    const len = this.banners.length;
    if (len === 0) return;
    this.currentIndex.update((i) => (i + 1) % len);
  }

  prev(): void {
    const len = this.banners.length;
    if (len === 0) return;
    this.currentIndex.update((i) => (i - 1 + len) % len);
  }

  pause(): void {
    this.isPaused.set(true);
  }

  resume(): void {
    this.isPaused.set(false);
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (this.banners.length <= 1) return;
    if (event.key === 'ArrowLeft') {
      this.prev();
      this.pause();
    } else if (event.key === 'ArrowRight') {
      this.next();
      this.pause();
    }
  }
}
