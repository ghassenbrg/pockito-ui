import { createAction, props } from '@ngrx/store';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '@api/model/category.model';
import { ViewMode } from '../models/category.types';

// Load Categories
export const loadCategories = createAction('[Category] Load Categories');
export const loadCategoriesSuccess = createAction(
  '[Category] Load Categories Success',
  props<{ categories: Category[] }>()
);
export const loadCategoriesFailure = createAction(
  '[Category] Load Categories Failure',
  props<{ error: string }>()
);

// Load Single Category by ID
export const loadCategoryById = createAction(
  '[Category] Load Category By ID',
  props<{ categoryId: string }>()
);
export const loadCategoryByIdSuccess = createAction(
  '[Category] Load Category By ID Success',
  props<{ category: Category }>()
);
export const loadCategoryByIdFailure = createAction(
  '[Category] Load Category By ID Failure',
  props<{ error: string }>()
);

// Create Category
export const createCategory = createAction(
  '[Category] Create Category',
  props<{ categoryData: CreateCategoryDto }>()
);
export const createCategorySuccess = createAction(
  '[Category] Create Category Success',
  props<{ category: Category }>()
);
export const createCategoryFailure = createAction(
  '[Category] Create Category Failure',
  props<{ error: string }>()
);

// Update Category
export const updateCategory = createAction(
  '[Category] Update Category',
  props<{ categoryId: string; categoryData: UpdateCategoryDto }>()
);
export const updateCategorySuccess = createAction(
  '[Category] Update Category Success',
  props<{ category: Category }>()
);
export const updateCategoryFailure = createAction(
  '[Category] Update Category Failure',
  props<{ error: string }>()
);

// Delete Category
export const deleteCategory = createAction(
  '[Category] Delete Category',
  props<{ category: Category }>()
);
export const deleteCategorySuccess = createAction(
  '[Category] Delete Category Success',
  props<{ categoryId: string }>()
);
export const deleteCategoryFailure = createAction(
  '[Category] Delete Category Failure',
  props<{ error: string }>()
);

// UI State
export const setSelectedCategory = createAction(
  '[Category] Set Selected Category',
  props<{ category: Category | null }>()
);

export const setViewMode = createAction(
  '[Category] Set View Mode',
  props<{ viewMode: ViewMode }>()
);

// Enhanced error handling actions
export const clearError = createAction('[Category] Clear Error');
export const clearOperationError = createAction(
  '[Category] Clear Operation Error',
  props<{ operation: string }>()
);
export const clearAllErrors = createAction('[Category] Clear All Errors');

// Success tracking actions
export const clearSuccessState = createAction('[Category] Clear Success State');

// Loading state management actions
export const setGlobalLoading = createAction(
  '[Category] Set Global Loading',
  props<{ isLoading: boolean }>()
);
export const setOperationLoading = createAction(
  '[Category] Set Operation Loading',
  props<{ operation: string; isLoading: boolean }>()
);
