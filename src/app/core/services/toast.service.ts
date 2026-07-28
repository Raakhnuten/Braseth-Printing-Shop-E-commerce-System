import { Injectable, signal, computed } from '@angular/core';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);
  private nextId = 0;

  readonly toasts = computed(() => this._toasts());

  success(message: string, duration = 4000): void {
    this.addToast('success', message, duration);
  }

  error(message: string, duration = 4000): void {
    this.addToast('error', message, duration);
  }

  info(message: string, duration = 4000): void {
    this.addToast('info', message, duration);
  }

  warning(message: string, duration = 4000): void {
    this.addToast('warning', message, duration);
  }

  dismiss(id: number): void {
    this._toasts.update((toasts) => toasts.filter((t) => t.id !== id));
  }

  private addToast(
    type: Toast['type'],
    message: string,
    duration: number,
  ): void {
    const id = this.nextId++;
    const toast: Toast = { id, type, message, duration };

    this._toasts.update((toasts) => [...toasts, toast]);

    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }
}
