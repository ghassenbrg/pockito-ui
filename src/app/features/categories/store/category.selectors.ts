import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CategoryState } from './category.state';

export const selectCategoryState = createFeatureSelector<CategoryState>('category');

// Basic selectors
export const selectCategories = createSelector(
  selectCategoryState,
  (state: CategoryState) => state.categories
);

export const selectSelectedCategory = createSelector(
  selectCategoryState,
  (state: CategoryState) => state.selectedCategory
);

export const selectViewMode = createSelector(
  selectCategoryState,
  (state: CategoryState) => state.viewMode
);

// Loading state selectors
export const selectIsLoading = createSelector(
  selectCategoryState,
  (state: CategoryState) => state.isLoading
);

export const selectLoadingStates = createSelector(
  selectCategoryState,
  (state: CategoryState) => state.loadingStates
);

export const selectIsLoadingOperation = (operation: string) => createSelector(
  selectLoadingStates,
  (loadingStates) => loadingStates[operation as keyof typeof loadingStates] || false
);

export const selectIsLoadingCategories = createSelector(
  selectLoadingStates,
  (loadingStates) => loadingStates.loadCategories
);

export const selectIsLoadingCategoryById = createSelector(
  selectLoadingStates,
  (loadingStates) => loadingStates.loadCategoryById
);

export const selectIsCreatingCategory = createSelector(
  selectLoadingStates,
  (loadingStates) => loadingStates.createCategory
);

export const selectIsUpdatingCategory = createSelector(
  selectLoadingStates,
  (loadingStates) => loadingStates.updateCategory
);

export const selectIsDeletingCategory = createSelector(
  selectLoadingStates,
  (loadingStates) => loadingStates.deleteCategory
);

// Error state selectors
export const selectError = createSelector(
  selectCategoryState,
  (state: CategoryState) => state.error
);

export const selectOperationErrors = createSelector(
  selectCategoryState,
  (state: CategoryState) => state.operationErrors
);

export const selectOperationError = (operation: string) => createSelector(
  selectOperationErrors,
  (operationErrors) => operationErrors[operation as keyof typeof operationErrors] || null
);

export const selectHasAnyError = createSelector(
  selectCategoryState,
  (state: CategoryState) => !!state.error || Object.values(state.operationErrors).some(error => !!error)
);

export const selectHasOperationError = (operation: string) => createSelector(
  selectOperationErrors,
  (operationErrors) => !!operationErrors[operation as keyof typeof operationErrors]
);

// Success state selectors
export const selectLastSuccessfulOperation = createSelector(
  selectCategoryState,
  (state: CategoryState) => state.lastSuccessfulOperation
);

export const selectHasSuccessfulOperation = createSelector(
  selectLastSuccessfulOperation,
  (lastSuccessfulOperation) => !!lastSuccessfulOperation.type
);

export const selectSuccessfulOperationType = createSelector(
  selectLastSuccessfulOperation,
  (lastSuccessfulOperation) => lastSuccessfulOperation.type
);

export const selectSuccessfulOperationTimestamp = createSelector(
  selectLastSuccessfulOperation,
  (lastSuccessfulOperation) => lastSuccessfulOperation.timestamp
);

// Computed selectors
export const selectActiveCategories = createSelector(
  selectCategories,
  (categories) => categories.filter(category => category.active !== false)
);

export const selectRootCategories = createSelector(
  selectCategories,
  (categories) => categories.filter(category => !category.parentCategoryId)
);

export const selectCategoriesByType = (type: string) => createSelector(
  selectCategories,
  (categories) => categories.filter(category => category.categoryType === type)
);

export const selectExpenseCategories = createSelector(
  selectCategories,
  (categories) => categories.filter(category => category.categoryType === 'EXPENSE')
);

export const selectIncomeCategories = createSelector(
  selectCategories,
  (categories) => categories.filter(category => category.categoryType === 'INCOME')
);

export const selectCategoryById = (id: string) => createSelector(
  selectCategories,
  (categories) => categories.find(category => category.id === id)
);

export const selectChildCategories = (parentId: string) => createSelector(
  selectCategories,
  (categories) => categories.filter(category => category.parentCategoryId === parentId)
);

export const selectCategoriesByColor = (color: string) => createSelector(
  selectCategories,
  (categories) => categories.filter(category => category.color === color)
);

export const selectHierarchicalCategories = createSelector(
  selectCategories,
  (categories) => {
    // Sort categories hierarchically (parents first, then children)
    const rootCategories = categories.filter(cat => !cat.parentCategoryId);
    const childCategories = categories.filter(cat => cat.parentCategoryId);
    
    return [...rootCategories, ...childCategories];
  }
);

// Combined loading and error selectors for specific operations
export const selectCategoryOperationState = (operation: string) => createSelector(
  selectIsLoadingOperation(operation),
  selectOperationError(operation),
  (isLoading, error) => ({
    isLoading,
    error,
    hasError: !!error
  })
);

export const selectCreateCategoryState = createSelector(
  selectIsCreatingCategory,
  selectOperationError('createCategory'),
  (isLoading, error) => ({
    isLoading,
    error,
    hasError: !!error
  })
);

export const selectUpdateCategoryState = createSelector(
  selectIsUpdatingCategory,
  selectOperationError('updateCategory'),
  (isLoading, error) => ({
    isLoading,
    error,
    hasError: !!error
  })
);

export const selectLoadCategoryByIdState = createSelector(
  selectIsLoadingCategoryById,
  selectOperationError('loadCategoryById'),
  (isLoading, error) => ({
    isLoading,
    error,
    hasError: !!error
  })
);
