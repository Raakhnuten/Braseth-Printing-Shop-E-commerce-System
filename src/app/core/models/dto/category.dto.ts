export interface CategoryResponseDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  enabled: boolean;
  sortOrder: number;
  parentId: string | null;
  parentName: string | null;
  childIds: string[];
}

export interface CreateCategoryRequestDto {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  enabled: boolean;
  sortOrder: number;
  parentId: string | null;
}

export type UpdateCategoryRequestDto = Partial<CreateCategoryRequestDto>;
