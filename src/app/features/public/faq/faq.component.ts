import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSection {
  title: string;
  items: FaqItem[];
}

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeaderComponent],
})
export class FaqComponent {
  title = 'Frequently Asked Questions';
  subtitle = 'Quick answers to common questions about our products and services';
  breadcrumbs = [
    { label: 'Home', url: '/' },
    { label: 'FAQ', url: '/faq' },
  ];

  openItems = signal<Set<string>>(new Set());

  sections: FaqSection[] = [
    {
      title: 'Ordering',
      items: [
        {
          question: 'How do I place an order?',
          answer: 'Browse our products, select the items you want, choose your size and quantity, then add them to your cart. When ready, proceed to checkout, enter your shipping details, and complete payment.',
        },
        {
          question: 'Can I modify or cancel my order after placing it?',
          answer: 'You can cancel your order as long as it has not entered production. Once production begins, the order cannot be modified or cancelled. Please contact support as soon as possible if you need changes.',
        },
        {
          question: 'What is the minimum order quantity?',
          answer: 'There is no minimum order quantity for standard products. For custom bulk orders, the minimum quantity may vary depending on the product type. Contact our team for bulk pricing.',
        },
        {
          question: 'Do you offer bulk or wholesale pricing?',
          answer: 'Yes, we offer discounted pricing for bulk orders. Contact our business partnerships team at partners@braseth.com for a custom quote based on your quantity and design requirements.',
        },
      ],
    },
    {
      title: 'Shipping & Delivery',
      items: [
        {
          question: 'What are the available shipping methods?',
          answer: 'We offer standard shipping (5-7 business days), express shipping (2-3 business days), and same-day delivery within Addis Ababa for orders placed before 12 PM.',
        },
        {
          question: 'How can I track my order?',
          answer: 'Once your order is shipped, you will receive a tracking number via email. You can also view your order status and tracking information from your account dashboard under "My Orders."',
        },
        {
          question: 'Do you ship internationally?',
          answer: 'Currently, we ship within Ethiopia only. We are planning to expand to East African countries soon. Sign up for our newsletter to be notified when international shipping becomes available.',
        },
        {
          question: 'What if my package is lost or damaged?',
          answer: 'If your package arrives damaged or is lost in transit, please contact our support team within 48 hours of delivery (or expected delivery date) with your order number and photos of any damage.',
        },
      ],
    },
    {
      title: 'Returns & Refunds',
      items: [
        {
          question: 'What is your return policy?',
          answer: 'We accept returns within 14 days of delivery for standard products in unused condition with original packaging. Custom-printed items can only be returned if there is a manufacturing defect.',
        },
        {
          question: 'How do I request a refund?',
          answer: 'To request a refund, go to your order details page and click "Request Refund," or contact our support team with your order number. Refunds are processed within 5-7 business days after we receive the returned item.',
        },
        {
          question: 'Can I exchange a product instead of returning it?',
          answer: 'Yes, we offer exchanges for different sizes or colors on standard products. Contact support within 14 days of delivery to arrange an exchange.',
        },
      ],
    },
    {
      title: 'Custom Printing',
      items: [
        {
          question: 'What file formats do you accept for custom designs?',
          answer: 'We accept PNG, JPG, SVG, and PDF files. For best results, upload high-resolution images (at least 300 DPI) in PNG or SVG format with a transparent background.',
        },
        {
          question: 'Can I see a preview before printing?',
          answer: 'Yes, our design tool shows a real-time preview of how your artwork will appear on the product. You can adjust placement, size, and orientation before adding to cart.',
        },
        {
          question: 'What printing methods do you use?',
          answer: 'We use Direct-to-Garment (DTG) for detailed full-color prints, screen printing for bulk orders, and heat transfer vinyl for names and numbers. The method depends on the product and design complexity.',
        },
        {
          question: 'How long does custom printing take?',
          answer: 'Custom orders typically take 2-3 business days to produce before shipping. Complex or bulk orders may require additional time. You will be notified if there are any delays.',
        },
      ],
    },
  ];

  toggleItem(sectionIndex: number, itemIndex: number): void {
    const key = `${sectionIndex}-${itemIndex}`;
    this.openItems.update((items) => {
      const newSet = new Set(items);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  }

  isOpen(sectionIndex: number, itemIndex: number): boolean {
    return this.openItems().has(`${sectionIndex}-${itemIndex}`);
  }
}
