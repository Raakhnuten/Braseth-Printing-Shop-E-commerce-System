export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  linkText: string;
  position: BannerPosition;
  enabled: boolean;
  sortOrder: number;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export enum BannerPosition {
  HERO = 'HERO',
  SIDEBAR = 'SIDEBAR',
  FOOTER = 'FOOTER',
  PROMO = 'PROMO',
}