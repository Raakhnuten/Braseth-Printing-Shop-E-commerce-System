import { Banner, BannerPosition } from '../../models/banner.model';
import { BannerResponseDto, CreateBannerRequestDto } from '../../models/dto/banner.dto';

export function mapBannerDtoToBanner(dto: BannerResponseDto): Banner {
  return {
    id: dto.id,
    title: dto.title,
    subtitle: dto.subtitle,
    imageUrl: dto.imageUrl,
    linkUrl: dto.linkUrl,
    linkText: dto.linkText,
    position: dto.position as BannerPosition,
    enabled: dto.enabled,
    sortOrder: dto.sortOrder,
    startsAt: dto.startsAt,
    endsAt: dto.endsAt,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export function mapCreateBannerToDto(banner: Partial<Banner>): CreateBannerRequestDto {
  return {
    title: banner.title || '',
    subtitle: banner.subtitle || '',
    imageUrl: banner.imageUrl || '',
    linkUrl: banner.linkUrl || '',
    linkText: banner.linkText || '',
    position: banner.position || BannerPosition.HERO,
    enabled: banner.enabled ?? true,
    sortOrder: banner.sortOrder ?? 0,
    startsAt: banner.startsAt ?? null,
    endsAt: banner.endsAt ?? null,
  };
}
