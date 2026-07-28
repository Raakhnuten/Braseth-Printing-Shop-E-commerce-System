import { Component } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
  imports: [PageHeaderComponent],
})
export class ContactComponent {
  title = 'Contact Us';
  subtitle = 'Get in touch with our team for support, inquiries, or feedback';
  breadcrumbs = [
    { label: 'Home', url: '/' },
    { label: 'Contact Us', url: '/contact' },
  ];
}
