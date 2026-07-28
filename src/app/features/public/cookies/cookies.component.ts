import { Component } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-cookies',
  templateUrl: './cookies.component.html',
  styleUrl: './cookies.component.scss',
  imports: [PageHeaderComponent],
})
export class CookiesComponent {
  title = 'Cookies Policy';
  subtitle = 'Understanding how we use cookies to improve your experience';
  breadcrumbs = [
    { label: 'Home', url: '/' },
    { label: 'Cookies Policy', url: '/cookies' },
  ];
}
