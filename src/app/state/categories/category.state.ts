import { createReducer, on } from '@ngrx/store';
import { Category } from '@shared/models';
import * as CategoryActions from './category.actions';

export interface CategoryState {
  categories: Category[];
  selectedCategory: Category | null;
  loading: boolean;
  error: string | null;
  creating: boolean;
  updating: boolean;
  archiving: boolean;
  activating: boolean;
}

export const initialState: CategoryState = {
  categories: [],
  selectedCategory: null,
  loading: false,
  error: null,
  creating: false,
  updating: false,
  archiving: false,
  activating: false
};

export const categoryReducer = createReducer(
  initialState,
  
  // Load categories
  on(CategoryActions.loadCategories, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(CategoryActions.loadCategoriesSuccess, (state, { categories }) => ({
    ...state,
    categories,
    loading: false,
    error: null
  })),
  
  on(CategoryActions.loadCategoriesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Load single category
  on(CategoryActions.loadCategory, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(CategoryActions.loadCategorySuccess, (state, { category }) => ({
    ...state,
    selectedCategory: category,
    loading: false,
    error: null
  })),
  
  on(CategoryActions.loadCategoryFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Create category
  on(CategoryActions.createCategory, (state) => ({
    ...state,
    creating: true,
    error: null
  })),
  
  on(CategoryActions.createCategorySuccess, (state, { category }) => ({
    ...state,
    categories: [...state.categories, category],
    creating: false,
    error: null
  })),
  
  on(CategoryActions.createCategoryFailure, (state, { error }) => ({
    ...state,
    creating: false,
    error
  })),
  
  // Update category
  on(CategoryActions.updateCategory, (state) => ({
    ...state,
    updating: true,
    error: null
  })),
  
  on(CategoryActions.updateCategorySuccess, (state, { category }) => ({
    ...state,
    categories: state.categories.map(c => c.id === category.id ? category : c),
    selectedCategory: state.selectedCategory?.id === category.id ? category : state.selectedCategory,
    updating: false,
    error: null
  })),
  
  on(CategoryActions.updateCategoryFailure, (state, { error }) => ({
    ...state,
    updating: false,
    error
  })),
  
  // Archive category
  on(CategoryActions.archiveCategory, (state) => ({
    ...state,
    archiving: true,
    error: null
  })),
  
  on(CategoryActions.archiveCategorySuccess, (state, { categoryId }) => ({
    ...state,
    categories: state.categories.filter(c => c.id !== categoryId),
    selectedCategory: state.selectedCategory?.id === categoryId ? null : state.selectedCategory,
    archiving: false,
    error: null
  })),
  
  on(CategoryActions.archiveCategoryFailure, (state, { error }) => ({
    ...state,
    archiving: false,
    error
  })),
  
  // Activate category
  on(CategoryActions.activateCategory, (state) => ({
    ...state,
    activating: true,
    error: null
  })),
  
  on(CategoryActions.activateCategorySuccess, (state, { categoryId: _categoryId }) => ({
    ...state,
    // Since we're reloading categories after activation, we don't need to add it here
    // The categories will be refreshed from the API
    activating: false,
    error: null
  })),
  
  on(CategoryActions.activateCategoryFailure, (state, { error }) => ({
    ...state,
    activating: false,
    error
  })),
  
  // Clear error
  on(CategoryActions.clearCategoryError, (state) => ({
    ...state,
    error: null
  })),
  
  // Clear selected category
  on(CategoryActions.clearSelectedCategory, (state) => ({
    ...state,
    selectedCategory: null
  }))
);
