import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CategoryState } from './category.state';

export const selectCategoryState = createFeatureSelector<CategoryState>('categories');

export const selectAllCategories = createSelector(
  selectCategoryState,
  (state: CategoryState) => state.categories
);

export const selectCategoriesByType = createSelector(
  selectAllCategories,
  (categories) => (type: 'EXPENSE' | 'INCOME') => 
    categories.filter(category => category.type === type)
);

export const selectExpenseCategories = createSelector(
  selectAllCategories,
  (categories) => categories.filter(category => category.type === 'EXPENSE')
);

export const selectIncomeCategories = createSelector(
  selectAllCategories,
  (categories) => categories.filter(category => category.type === 'INCOME')
);

export const selectSelectedCategory = createSelector(
  selectCategoryState,
  (state: CategoryState) => state.selectedCategory
);

export const selectCategoriesLoading = createSelector(
  selectCategoryState,
  (state: CategoryState) => state.loading
);

export const selectCategoriesError = createSelector(
  selectCategoryState,
  (state: CategoryState) => state.error
);

export const selectCategoryCreating = createSelector(
  selectCategoryState,
  (state: CategoryState) => state.creating
);

export const selectCategoryUpdating = createSelector(
  selectCategoryState,
  (state: CategoryState) => state.updating
);

export const selectCategoryArchiving = createSelector(
  selectCategoryState,
  (state: CategoryState) => state.archiving
);

export const selectCategoryActivating = createSelector(
  selectCategoryState,
  (state: CategoryState) => state.activating
);
