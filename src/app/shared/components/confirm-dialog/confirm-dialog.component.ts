import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  inject,
  ElementRef,
  viewChild,
  effect,
} from '@angular/core';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class ConfirmDialogComponent implements OnDestroy {
  private readonly dialogService = inject(ConfirmDialogService);

  readonly state = this.dialogService.state;

  private readonly dialogEl =
    viewChild<ElementRef<HTMLElement>>('dialogPanel');

  private previouslyFocusedElement: HTMLElement | null = null;

  constructor() {
    effect(() => {
      const currentState = this.state();
      if (currentState.isOpen) {
        this.previouslyFocusedElement =
          document.activeElement as HTMLElement | null;
        setTimeout(() => this.focusFirstElement());
      } else if (this.previouslyFocusedElement) {
        this.previouslyFocusedElement.focus();
        this.previouslyFocusedElement = null;
      }
    });
  }

  ngOnDestroy(): void {
    // Auto-cancel if the component is destroyed while dialog is open
    // to prevent the ConfirmDialogService Subject from leaking
    if (this.state().isOpen) {
      this.dialogService.cancel();
    }
  }

  onConfirm(): void {
    this.dialogService.confirm();
  }

  onCancel(): void {
    this.dialogService.cancel();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('confirm-dialog__overlay')) {
      this.onCancel();
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.onCancel();
      return;
    }

    if (event.key === 'Tab') {
      this.trapFocus(event);
    }
  }

  private trapFocus(event: KeyboardEvent): void {
    const dialog = this.dialogEl()?.nativeElement;
    if (!dialog) return;

    const focusableSelectors =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = Array.from(
      dialog.querySelectorAll<HTMLElement>(focusableSelectors),
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  private focusFirstElement(): void {
    const dialog = this.dialogEl()?.nativeElement;
    if (!dialog) return;

    const focusable = dialog.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusable?.focus();
  }
}
