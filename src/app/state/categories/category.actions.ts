import { createAction, props } from '@ngrx/store';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@shared/models';

// Load categories
export const loadCategories = createAction('[Category] Load Categories');
export const loadCategoriesSuccess = createAction(
  '[Category] Load Categories Success',
  props<{ categories: Category[] }>()
);
export const loadCategoriesFailure = createAction(
  '[Category] Load Categories Failure',
  props<{ error: string }>()
);

// Load single category
export const loadCategory = createAction(
  '[Category] Load Category',
  props<{ id: string }>()
);
export const loadCategorySuccess = createAction(
  '[Category] Load Category Success',
  props<{ category: Category }>()
);
export const loadCategoryFailure = createAction(
  '[Category] Load Category Failure',
  props<{ error: string }>()
);

// Create category
export const createCategory = createAction(
  '[Category] Create Category',
  props<{ category: CreateCategoryRequest }>()
);
export const createCategorySuccess = createAction(
  '[Category] Create Category Success',
  props<{ category: Category }>()
);
export const createCategoryFailure = createAction(
  '[Category] Create Category Failure',
  props<{ error: string }>()
);

// Update category
export const updateCategory = createAction(
  '[Category] Update Category',
  props<{ id: string; category: UpdateCategoryRequest }>()
);
export const updateCategorySuccess = createAction(
  '[Category] Update Category Success',
  props<{ category: Category }>()
);
export const updateCategoryFailure = createAction(
  '[Category] Update Category Failure',
  props<{ error: string }>()
);

// Archive category
export const archiveCategory = createAction(
  '[Category] Archive Category',
  props<{ id: string }>()
);
export const archiveCategorySuccess = createAction(
  '[Category] Archive Category Success',
  props<{ categoryId: string }>()
);
export const archiveCategoryFailure = createAction(
  '[Category] Archive Category Failure',
  props<{ error: string }>()
);

// Activate category
export const activateCategory = createAction(
  '[Category] Activate Category',
  props<{ id: string }>()
);
export const activateCategorySuccess = createAction(
  '[Category] Activate Category Success',
  props<{ categoryId: string }>()
);
export const activateCategoryFailure = createAction(
  '[Category] Activate Category Failure',
  props<{ error: string }>()
);

// Clear error
export const clearCategoryError = createAction('[Category] Clear Error');

// Clear selected category
export const clearSelectedCategory = createAction('[Category] Clear Selected Category');
