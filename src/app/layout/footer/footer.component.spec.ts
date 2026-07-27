import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { FooterComponent } from './footer.component';
import {
  SITE_CONTACT_INFO,
  SiteContactInfo,
} from '../../core/config/site-contact.config';

const mockContactInfo: SiteContactInfo = {
  email: 'test@example.com',
  location: 'Test City',
};

describe('FooterComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [
        provideRouter([]),
        { provide: SITE_CONTACT_INFO, useValue: mockContactInfo },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(FooterComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should have the current year', () => {
    const fixture = TestBed.createComponent(FooterComponent);
    const component = fixture.componentInstance;
    expect(component.year).toBe(new Date().getFullYear());
  });

  describe('toggleAccordion', () => {
    it('should open a section when toggled', () => {
      const fixture = TestBed.createComponent(FooterComponent);
      const component = fixture.componentInstance;

      component.toggleAccordion('shop');
      expect(component.activeAccordion).toBe('shop');
    });

    it('should close a section when toggled again', () => {
      const fixture = TestBed.createComponent(FooterComponent);
      const component = fixture.componentInstance;

      component.toggleAccordion('shop');
      component.toggleAccordion('shop');
      expect(component.activeAccordion).toBeNull();
    });

    it('should only keep one section open at a time', () => {
      const fixture = TestBed.createComponent(FooterComponent);
      const component = fixture.componentInstance;

      component.toggleAccordion('shop');
      expect(component.activeAccordion).toBe('shop');

      component.toggleAccordion('support');
      expect(component.activeAccordion).toBe('support');
    });
  });

  it('should expose email from injected config', () => {
    const fixture = TestBed.createComponent(FooterComponent);
    const component = fixture.componentInstance;
    expect(component.email).toBe('test@example.com');
  });

  it('should expose location from injected config', () => {
    const fixture = TestBed.createComponent(FooterComponent);
    const component = fixture.componentInstance;
    expect(component.location).toBe('Test City');
  });
});
