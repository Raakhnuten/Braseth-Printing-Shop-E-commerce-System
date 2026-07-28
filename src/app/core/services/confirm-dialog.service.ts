import { Injectable, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface ConfirmDialogConfig {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export interface ConfirmDialogState extends ConfirmDialogConfig {
  isOpen: boolean;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly _state = signal<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
  });

  private resultSubject: Subject<boolean> | null = null;

  readonly state = this._state.asReadonly();

  open(config: ConfirmDialogConfig): Observable<boolean> {
    this._state.set({
      isOpen: true,
      title: config.title,
      message: config.message,
      confirmLabel: config.confirmLabel ?? 'Confirm',
      cancelLabel: config.cancelLabel ?? 'Cancel',
    });

    this.resultSubject = new Subject<boolean>();
    return this.resultSubject.asObservable();
  }

  confirm(): void {
    this.close(true);
  }

  cancel(): void {
    this.close(false);
  }

  private close(result: boolean): void {
    this._state.update((state) => ({ ...state, isOpen: false }));
    if (this.resultSubject) {
      this.resultSubject.next(result);
      this.resultSubject.complete();
      this.resultSubject = null;
    }
  }
}
