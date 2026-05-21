import { Category } from '../../models/category.model';
import { CategoryResponseDto, CreateCategoryRequestDto } from '../../models/dto/category.dto';

export function mapCategoryDtoToCategory(dto: CategoryResponseDto): Category {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    description: dto.description,
    imageUrl: dto.imageUrl,
    enabled: dto.enabled,
    sortOrder: dto.sortOrder,
    parentId: dto.parentId,
    parentName: dto.parentName,
    childIds: dto.childIds || [],
  };
}

export function mapCreateCategoryToDto(category: Partial<Category>): CreateCategoryRequestDto {
  return {
    name: category.name || '',
    slug: category.slug || '',
    description: category.description || '',
    imageUrl: category.imageUrl || '',
    enabled: category.enabled ?? true,
    sortOrder: category.sortOrder ?? 0,
    parentId: category.parentId ?? null,
  };
}
