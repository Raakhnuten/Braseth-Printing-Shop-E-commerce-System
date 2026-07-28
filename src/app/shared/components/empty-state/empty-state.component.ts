import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  @Input() title: string = 'No Data';
  @Input() message: string = 'There is no data to display.';
  @Input() icon: string = 'empty-box';
}
