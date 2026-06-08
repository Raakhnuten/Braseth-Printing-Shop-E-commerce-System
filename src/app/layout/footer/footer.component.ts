import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  imports: [NgClass, RouterLink],
})
export class FooterComponent {
  year = new Date().getFullYear();
  activeAccordion: string | null = null;

  toggleAccordion(section: string): void {
    this.activeAccordion = this.activeAccordion === section ? null : section;
  }
}
