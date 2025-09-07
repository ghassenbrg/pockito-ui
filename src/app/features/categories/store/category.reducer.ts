import { createReducer, on } from '@ngrx/store';
import * as CategoryActions from './category.actions';
import { initialState } from './category.state';

export const categoryReducer = createReducer(
  initialState,

  // Load Categories
  on(CategoryActions.loadCategories, (state) => ({
    ...state,
    isLoading: true,
    loadingStates: { ...state.loadingStates, loadCategories: true },
    error: null,
    operationErrors: { ...state.operationErrors, loadCategories: null },
  })),

  on(CategoryActions.loadCategoriesSuccess, (state, { categories }) => ({
    ...state,
    categories,
    isLoading: false,
    loadingStates: { ...state.loadingStates, loadCategories: false },
    error: null,
    operationErrors: { ...state.operationErrors, loadCategories: null },
    lastSuccessfulOperation: { type: 'loadCategories', timestamp: Date.now() },
  })),

  on(CategoryActions.loadCategoriesFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    loadingStates: { ...state.loadingStates, loadCategories: false },
    error,
    operationErrors: { ...state.operationErrors, loadCategories: error },
  })),

  // Load Single Category by ID
  on(CategoryActions.loadCategoryById, (state) => ({
    ...state,
    isLoading: true,
    loadingStates: { ...state.loadingStates, loadCategoryById: true },
    error: null,
    operationErrors: { ...state.operationErrors, loadCategoryById: null },
  })),

  on(CategoryActions.loadCategoryByIdSuccess, (state, { category }) => ({
    ...state,
    categories: state.categories.some((c) => c.id === category.id)
      ? state.categories.map((c) => (c.id === category.id ? category : c))
      : [...state.categories, category],
    selectedCategory: category,
    isLoading: false,
    loadingStates: { ...state.loadingStates, loadCategoryById: false },
    error: null,
    operationErrors: { ...state.operationErrors, loadCategoryById: null },
    lastSuccessfulOperation: { type: 'loadCategoryById', timestamp: Date.now() },
  })),

  on(CategoryActions.loadCategoryByIdFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    loadingStates: { ...state.loadingStates, loadCategoryById: false },
    error,
    operationErrors: { ...state.operationErrors, loadCategoryById: error },
  })),

  // Create Category
  on(CategoryActions.createCategory, (state) => ({
    ...state,
    isLoading: true,
    loadingStates: { ...state.loadingStates, createCategory: true },
    error: null,
    operationErrors: { ...state.operationErrors, createCategory: null },
  })),

  on(CategoryActions.createCategorySuccess, (state, { category }) => ({
    ...state,
    categories: [...state.categories, category],
    isLoading: false,
    loadingStates: { ...state.loadingStates, createCategory: false },
    error: null,
    operationErrors: { ...state.operationErrors, createCategory: null },
    lastSuccessfulOperation: { type: 'createCategory', timestamp: Date.now() },
  })),

  on(CategoryActions.createCategoryFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    loadingStates: { ...state.loadingStates, createCategory: false },
    error,
    operationErrors: { ...state.operationErrors, createCategory: error },
  })),

  // Update Category
  on(CategoryActions.updateCategory, (state) => ({
    ...state,
    isLoading: true,
    loadingStates: { ...state.loadingStates, updateCategory: true },
    error: null,
    operationErrors: { ...state.operationErrors, updateCategory: null },
  })),

  on(CategoryActions.updateCategorySuccess, (state, { category }) => ({
    ...state,
    categories: state.categories.map((c) => (c.id === category.id ? category : c)),
    selectedCategory:
      state.selectedCategory?.id === category.id ? category : state.selectedCategory,
    isLoading: false,
    loadingStates: { ...state.loadingStates, updateCategory: false },
    error: null,
    operationErrors: { ...state.operationErrors, updateCategory: null },
    lastSuccessfulOperation: { type: 'updateCategory', timestamp: Date.now() },
  })),

  on(CategoryActions.updateCategoryFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    loadingStates: { ...state.loadingStates, updateCategory: false },
    error,
    operationErrors: { ...state.operationErrors, updateCategory: error },
  })),

  // Delete Category
  on(CategoryActions.deleteCategory, (state) => ({
    ...state,
    isLoading: true,
    loadingStates: { ...state.loadingStates, deleteCategory: true },
    error: null,
    operationErrors: { ...state.operationErrors, deleteCategory: null },
  })),

  on(CategoryActions.deleteCategorySuccess, (state, { categoryId }) => ({
    ...state,
    categories: state.categories.filter((c) => c.id !== categoryId),
    selectedCategory:
      state.selectedCategory?.id === categoryId ? null : state.selectedCategory,
    isLoading: false,
    loadingStates: { ...state.loadingStates, deleteCategory: false },
    error: null,
    operationErrors: { ...state.operationErrors, deleteCategory: null },
    lastSuccessfulOperation: { type: 'deleteCategory', timestamp: Date.now() },
  })),

  on(CategoryActions.deleteCategoryFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    loadingStates: { ...state.loadingStates, deleteCategory: false },
    error,
    operationErrors: { ...state.operationErrors, deleteCategory: error },
  })),

  // UI State
  on(CategoryActions.setSelectedCategory, (state, { category }) => ({
    ...state,
    selectedCategory: category,
  })),

  on(CategoryActions.setViewMode, (state, { viewMode }) => {
    // Save view mode to localStorage
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('category-view-mode', viewMode);
      }
    } catch (error) {
      console.warn('Failed to save view mode to localStorage:', error);
    }
    
    return {
      ...state,
      viewMode,
    };
  }),

  // Enhanced error handling
  on(CategoryActions.clearError, (state) => ({
    ...state,
    error: null,
  })),

  on(CategoryActions.clearOperationError, (state, { operation }) => ({
    ...state,
    operationErrors: { ...state.operationErrors, [operation]: null },
  })),

  on(CategoryActions.clearAllErrors, (state) => ({
    ...state,
    error: null,
    operationErrors: {
      loadCategories: null,
      loadCategoryById: null,
      createCategory: null,
      updateCategory: null,
      deleteCategory: null,
    },
  })),

  // Success state management
  on(CategoryActions.clearSuccessState, (state) => ({
    ...state,
    lastSuccessfulOperation: { type: null, timestamp: null },
  })),

  // Loading state management
  on(CategoryActions.setGlobalLoading, (state, { isLoading }) => ({
    ...state,
    isLoading,
  })),

  on(CategoryActions.setOperationLoading, (state, { operation, isLoading }) => ({
    ...state,
    loadingStates: { ...state.loadingStates, [operation]: isLoading },
  })),
);
