import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';

import { IconComponent } from '../../shared/components/icon/icon.component';
import {
  SITE_CONTACT_INFO,
  SiteContactInfo,
} from '../../core/config/site-contact.config';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  imports: [NgClass, RouterLink, IconComponent],
})
export class FooterComponent {
  year = new Date().getFullYear();
  activeAccordion: string | null = null;

  private readonly contactInfo: SiteContactInfo = inject(SITE_CONTACT_INFO);

  get email(): string {
    return this.contactInfo.email;
  }

  get location(): string {
    return this.contactInfo.location;
  }

  toggleAccordion(section: string): void {
    this.activeAccordion = this.activeAccordion === section ? null : section;
  }
}
