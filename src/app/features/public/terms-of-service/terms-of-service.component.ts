import { Component } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-terms-of-service',
  templateUrl: './terms-of-service.component.html',
  styleUrl: './terms-of-service.component.scss',
  imports: [PageHeaderComponent],
})
export class TermsOfServiceComponent {
  title = 'Terms of Service';
  subtitle = 'Please read these terms carefully before using our services';
  breadcrumbs = [
    { label: 'Home', url: '/' },
    { label: 'Terms of Service', url: '/terms-of-service' },
  ];
}
