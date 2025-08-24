export interface Category {
  id: string;
  userId: string;
  type: 'EXPENSE' | 'INCOME';
  name: string;
  color?: string;
  iconType?: 'EMOJI' | 'URL';
  iconValue?: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  type: 'EXPENSE' | 'INCOME';
  name: string;
  color?: string;
  iconType?: 'EMOJI' | 'URL';
  iconValue?: string;
  parentId?: string;
}

export interface UpdateCategoryRequest {
  type: 'EXPENSE' | 'INCOME';
  name: string;
  color?: string;
  iconType?: 'EMOJI' | 'URL';
  iconValue?: string;
  parentId?: string;
}

export interface CategoryType {
  value: 'EXPENSE' | 'INCOME';
  label: string;
  description?: string;
}

export const CATEGORY_TYPES: CategoryType[] = [
  { value: 'EXPENSE', label: 'Expense', description: 'Categories for money going out' },
  { value: 'INCOME', label: 'Income', description: 'Categories for money coming in' }
];
