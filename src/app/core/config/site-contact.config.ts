import { InjectionToken } from '@angular/core';

export interface SiteContactInfo {
  email: string;
  location: string;
}

export const SITE_CONTACT_INFO = new InjectionToken<SiteContactInfo>(
  'SiteContactInfo'
);

export const siteContactInfoValue: SiteContactInfo = {
  email: 'shiryuprem@gmail.com',
  location: 'Cambodia, Phnom Penh',
};
