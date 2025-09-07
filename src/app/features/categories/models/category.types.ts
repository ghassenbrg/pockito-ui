import { Category, CategoryType } from "@api/model/category.model";

// Re-export CategoryType for use in other feature modules
export { CategoryType };

export interface CategoryTypeOption {
  label: string;
  value: CategoryType;
}

export interface ParentCategoryOption {
  label: string;
  value: string; // category ID
}

export interface CategoryFormData {
  name: string;
  color: string;
  categoryType: CategoryType;
  iconUrl?: string;
  parentCategoryId?: string;
}

export interface CategoryDisplayData {
  id: string;
  name: string;
  color: string;
  categoryType: CategoryType;
  iconUrl?: string;
  parentCategoryId?: string;
  parentCategoryName?: string;
  active?: boolean;
  childCount?: number;
}

export interface CategoryOperationState {
  isLoading: boolean;
  error: string | null;
  hasError: boolean;
}

export interface CategoryFilterOptions {
  categoryType?: CategoryType;
  parentCategoryId?: string;
  active?: boolean;
  hasChildren?: boolean;
}

export interface CategorySortOptions {
  field: keyof Category;
  direction: 'asc' | 'desc';
}

// Enhanced type definitions for better type safety
export type ViewMode = 'cards' | 'list';

export interface CategoryCacheKey {
  categoryId: string;
  childCount: number;
  active: boolean;
}
