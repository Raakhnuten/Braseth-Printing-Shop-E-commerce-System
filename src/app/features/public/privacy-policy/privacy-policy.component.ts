import { Component } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss',
  imports: [PageHeaderComponent],
})
export class PrivacyPolicyComponent {
  title = 'Privacy Policy';
  subtitle = 'How we collect, use, and protect your personal information';
  breadcrumbs = [
    { label: 'Home', url: '/' },
    { label: 'Privacy Policy', url: '/privacy-policy' },
  ];
}
