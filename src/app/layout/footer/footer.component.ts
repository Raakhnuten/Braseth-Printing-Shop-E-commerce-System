import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  imports: [FormsModule],
})
export class FooterComponent {
  year = new Date().getFullYear();
  newsletterEmail = '';

  onSubscribe() {
    if (this.newsletterEmail) {
      // TODO: Implement newsletter subscription logic
      alert('Thank you for subscribing to Seth Store newsletter!');
      this.newsletterEmail = '';
    }
  }
}