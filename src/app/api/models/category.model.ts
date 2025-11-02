import { CategoryType } from './enum';

export interface CategoryRequest {
  name: string;
  color: string;
  categoryType: CategoryType;
  iconUrl?: string;
  parentCategoryId?: string;
}

export interface Category {
  id: string;
  username: string;
  name: string;
  color: string;
  categoryType: CategoryType;
  iconUrl?: string;
  parentCategoryId?: string;
  parentCategoryName?: string;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
  childCount: number;
}

export interface CategoryList {
  categories: Category[];
  totalCount: number;
}