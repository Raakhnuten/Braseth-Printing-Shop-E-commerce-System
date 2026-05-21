import { Category } from '../models/category.model';
import { PlatziCategory } from '../models/platzi/platzi-category.model';

export function mapPlatziCategoryToCategory(c: PlatziCategory): Category {
  return {
    id: String(c.id),
    name: c.name,
    slug: c.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, ''),
    description: '',
    imageUrl: c.image,
    enabled: true,
    sortOrder: 0,
    parentId: null,
    parentName: null,
    childIds: [],
  };
}
