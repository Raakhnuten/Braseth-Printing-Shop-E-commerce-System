import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  AfterViewChecked,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuSection } from '../../header.component';

@Component({
  selector: 'app-mobile-menu',
  templateUrl: './mobile-menu.component.html',
  styleUrl: './mobile-menu.component.scss',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileMenuComponent implements AfterViewChecked {
  private elementRef = inject(ElementRef);
  private focusTrapActive = false;
  private boundTrapFocus = this.trapFocus.bind(this);

  @Input() isOpen: boolean = false;
  @Input() isLoggedIn: boolean = false;
  @Input() isAdmin: boolean = false;
  @Input() displayName: string = '';
  @Input() userEmail: string = '';
  @Input() userInitials: string = '';
  @Input() menuSections: MenuSection[] = [];

  @Output() closed = new EventEmitter<void>();
  @Output() menuAction = new EventEmitter<string>();

  ngAfterViewChecked(): void {
    if (this.isOpen && !this.focusTrapActive) {
      this.activateFocusTrap();
    } else if (!this.isOpen && this.focusTrapActive) {
      this.deactivateFocusTrap();
    }
  }

  onClose(): void {
    this.closed.emit();
  }

  onMenuAction(action: string): void {
    this.menuAction.emit(action);
  }

  private activateFocusTrap(): void {
    this.focusTrapActive = true;
    this.elementRef.nativeElement.addEventListener('keydown', this.boundTrapFocus);
  }

  private deactivateFocusTrap(): void {
    this.focusTrapActive = false;
    this.elementRef.nativeElement.removeEventListener('keydown', this.boundTrapFocus);
  }

  private trapFocus(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;

    const focusableElements = this.elementRef.nativeElement.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

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
}
