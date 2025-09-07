import { Category } from '@api/model/category.model';
import { ViewMode } from '../models/category.types';

export interface CategoryState {
  categories: Category[];
  selectedCategory: Category | null;
  viewMode: ViewMode;
  
  // Global loading state
  isLoading: boolean;
  
  // Operation-specific loading states
  loadingStates: {
    loadCategories: boolean;
    loadCategoryById: boolean;
    createCategory: boolean;
    updateCategory: boolean;
    deleteCategory: boolean;
  };
  
  // Error handling
  error: string | null;
  operationErrors: {
    loadCategories: string | null;
    loadCategoryById: string | null;
    createCategory: string | null;
    updateCategory: string | null;
    deleteCategory: string | null;
  };
  
  // Success states for navigation
  lastSuccessfulOperation: {
    type: string | null;
    timestamp: number | null;
  };
}

// Helper function to get view mode from localStorage
const getInitialViewMode = (): ViewMode => {
  try {
    // Check if localStorage is available (some browsers/contexts might not support it)
    if (typeof localStorage === 'undefined') {
      return 'cards';
    }
    
    const savedViewMode = localStorage.getItem('category-view-mode');
    if (savedViewMode === 'cards' || savedViewMode === 'list') {
      return savedViewMode;
    }
    
    // If no valid saved preference, default to cards
    return 'cards';
  } catch (error) {
    console.warn('Failed to load view mode from localStorage:', error);
    return 'cards';
  }
};

export const initialState: CategoryState = {
  categories: [],
  selectedCategory: null,
  viewMode: getInitialViewMode(),
  
  // Global loading state
  isLoading: false,
  
  // Operation-specific loading states
  loadingStates: {
    loadCategories: false,
    loadCategoryById: false,
    createCategory: false,
    updateCategory: false,
    deleteCategory: false,
  },
  
  // Error handling
  error: null,
  operationErrors: {
    loadCategories: null,
    loadCategoryById: null,
    createCategory: null,
    updateCategory: null,
    deleteCategory: null,
  },
  
  // Success states for navigation
  lastSuccessfulOperation: {
    type: null,
    timestamp: null,
  },
};
