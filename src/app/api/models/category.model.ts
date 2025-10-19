export interface CategoryDto {
  id?: string;
  username?: string;
  name: string;
  color: string;
  categoryType: CategoryType;
  iconUrl?: string;
  parentCategoryId?: string;
  parentCategoryName?: string;
  active?: boolean;
  childCount?: number;
}

export enum CategoryType {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME'
}
