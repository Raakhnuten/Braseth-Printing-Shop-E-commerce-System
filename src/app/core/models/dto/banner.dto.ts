export interface BannerResponseDto {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  linkText: string;
  position: string;
  enabled: boolean;
  sortOrder: number;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBannerRequestDto {
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  linkText: string;
  position: string;
  enabled: boolean;
  sortOrder: number;
  startsAt: string | null;
  endsAt: string | null;
}

export type UpdateBannerRequestDto = Partial<CreateBannerRequestDto>;
