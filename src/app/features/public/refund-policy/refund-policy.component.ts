import { Component, ChangeDetectionStrategy } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-refund-policy',
  templateUrl: './refund-policy.component.html',
  styleUrl: './refund-policy.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeaderComponent],
})
export class RefundPolicyComponent {
  title = 'Refund Policy';
  subtitle = 'Our commitment to your satisfaction with every purchase';
  breadcrumbs = [
    { label: 'Home', url: '/' },
    { label: 'Refund Policy', url: '/refund-policy' },
  ];
}
