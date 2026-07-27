import { Component, input } from '@angular/core';

export type IconName =
  | 'facebook'
  | 'telegram'
  | 'instagram'
  | 'x'
  | 'email'
  | 'location'
  | 'chevron';

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss',
})
export class IconComponent {
  name = input.required<IconName>();
  size = input<number>(20);
}
