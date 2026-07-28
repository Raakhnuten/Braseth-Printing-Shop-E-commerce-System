import { Component, ChangeDetectionStrategy } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrl: './help.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeaderComponent],
})
export class HelpComponent {
  title = 'Help Center';
  subtitle = 'Find answers to your questions and get the support you need';
  breadcrumbs = [
    { label: 'Home', url: '/' },
    { label: 'Help Center', url: '/help' },
  ];
}
