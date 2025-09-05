// Category type enum matching the backend
export enum CategoryType {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME'
}

// Base Category interface matching CategoryDto from backend
export interface Category {
  id: string;
  username: string;
  name: string;
  color: string;
  categoryType: CategoryType;
  iconUrl?: string;
  parentCategoryId?: string;
  parentCategoryName?: string;
  active?: boolean;
  childCount?: number;
}

// DTO for creating a new category
export interface CreateCategoryDto {
  name: string;
  color: string;
  categoryType: CategoryType;
  iconUrl?: string;
  parentCategoryId?: string;
}

// DTO for updating an existing category
export interface UpdateCategoryDto {
  name?: string;
  color?: string;
  categoryType?: CategoryType;
  iconUrl?: string;
  parentCategoryId?: string;
}
