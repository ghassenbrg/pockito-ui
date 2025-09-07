import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '@api/model/category.model';
import { CategoryFormData, ViewMode } from '../models/category.types';
import * as CategoryActions from '../store/category.actions';
import * as CategorySelectors from '../store/category.selectors';

@Injectable({
  providedIn: 'root'
})
export class CategoryFacade {
  // State selectors
  categories$ = this.store.select(CategorySelectors.selectCategories);
  selectedCategory$ = this.store.select(CategorySelectors.selectSelectedCategory);
  viewMode$ = this.store.select(CategorySelectors.selectViewMode);
  
  // Loading state selectors
  isLoading$ = this.store.select(CategorySelectors.selectIsLoading);
  loadingStates$ = this.store.select(CategorySelectors.selectLoadingStates);
  
  // Operation-specific loading selectors
  isCreatingCategory$ = this.store.select(CategorySelectors.selectIsCreatingCategory);
  isUpdatingCategory$ = this.store.select(CategorySelectors.selectIsUpdatingCategory);
  isDeletingCategory$ = this.store.select(CategorySelectors.selectIsDeletingCategory);
  isLoadingCategoryById$ = this.store.select(CategorySelectors.selectIsLoadingCategoryById);
  
  // Error state selectors
  error$ = this.store.select(CategorySelectors.selectError);
  operationErrors$ = this.store.select(CategorySelectors.selectOperationErrors);
  hasAnyError$ = this.store.select(CategorySelectors.selectHasAnyError);
  
  // Success state selectors
  lastSuccessfulOperation$ = this.store.select(CategorySelectors.selectLastSuccessfulOperation);
  hasSuccessfulOperation$ = this.store.select(CategorySelectors.selectHasSuccessfulOperation);
  successfulOperationType$ = this.store.select(CategorySelectors.selectSuccessfulOperationType);
  
  // Combined operation state selectors
  createCategoryState$ = this.store.select(CategorySelectors.selectCreateCategoryState);
  updateCategoryState$ = this.store.select(CategorySelectors.selectUpdateCategoryState);
  loadCategoryByIdState$ = this.store.select(CategorySelectors.selectLoadCategoryByIdState);
  
  // Computed selectors
  activeCategories$ = this.store.select(CategorySelectors.selectActiveCategories);
  rootCategories$ = this.store.select(CategorySelectors.selectRootCategories);
  expenseCategories$ = this.store.select(CategorySelectors.selectExpenseCategories);
  incomeCategories$ = this.store.select(CategorySelectors.selectIncomeCategories);
  hierarchicalCategories$ = this.store.select(CategorySelectors.selectHierarchicalCategories);

  constructor(
    private store: Store,
    private router: Router
  ) {}

  // Actions
  loadCategories(): void {
    this.store.dispatch(CategoryActions.loadCategories());
  }

  loadCategoryById(categoryId: string): void {
    this.store.dispatch(CategoryActions.loadCategoryById({ categoryId }));
  }

  createCategory(categoryData: CategoryFormData): void {
    const categoryToCreate: CreateCategoryDto = {
      name: categoryData.name!,
      color: categoryData.color!,
      categoryType: categoryData.categoryType!,
      iconUrl: categoryData.iconUrl,
      parentCategoryId: categoryData.parentCategoryId
    };
    this.store.dispatch(CategoryActions.createCategory({ categoryData: categoryToCreate }));
  }

  updateCategory(categoryId: string, categoryData: CategoryFormData): void {
    this.store.dispatch(CategoryActions.updateCategory({ categoryId, categoryData }));
  }

  deleteCategory(category: Category): void {
    this.store.dispatch(CategoryActions.deleteCategory({ category }));
  }

  setSelectedCategory(category: Category | null): void {
    this.store.dispatch(CategoryActions.setSelectedCategory({ category }));
  }

  setViewMode(viewMode: ViewMode): void {
    this.store.dispatch(CategoryActions.setViewMode({ viewMode }));
  }

  // Utility method to get the current view mode from localStorage
  getStoredViewMode(): ViewMode {
    try {
      if (typeof localStorage === 'undefined') {
        return 'cards';
      }
      
      const savedViewMode = localStorage.getItem('category-view-mode');
      return (savedViewMode === 'cards' || savedViewMode === 'list') ? savedViewMode : 'cards';
    } catch (error) {
      console.warn('Failed to read view mode from localStorage:', error);
      return 'cards';
    }
  }

  // Utility method to clear stored view mode (useful for testing or reset functionality)
  clearStoredViewMode(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('category-view-mode');
      }
    } catch (error) {
      console.warn('Failed to clear view mode from localStorage:', error);
    }
  }

  // Enhanced error handling methods
  clearError(): void {
    this.store.dispatch(CategoryActions.clearError());
  }

  clearOperationError(operation: string): void {
    this.store.dispatch(CategoryActions.clearOperationError({ operation }));
  }

  clearAllErrors(): void {
    this.store.dispatch(CategoryActions.clearAllErrors());
  }

  // Success state management
  clearSuccessState(): void {
    this.store.dispatch(CategoryActions.clearSuccessState());
  }

  // Loading state management
  setGlobalLoading(isLoading: boolean): void {
    this.store.dispatch(CategoryActions.setGlobalLoading({ isLoading }));
  }

  setOperationLoading(operation: string, isLoading: boolean): void {
    this.store.dispatch(CategoryActions.setOperationLoading({ operation, isLoading }));
  }

  // Navigation methods
  navigateToCreateCategory(): void {
    this.router.navigate(['/app/categories/new']);
  }

  navigateToEditCategory(categoryId: string): void {
    this.router.navigate(['/app/categories/edit', categoryId]);
  }

  navigateToCategories(): void {
    this.router.navigate(['/app/categories']);
  }

  navigateToCategoryView(categoryId: string): void {
    this.router.navigate(['/app/categories/view', categoryId]);
  }

  // Utility methods
  getCategoriesByType(type: string): Observable<Category[]> {
    return this.store.select(CategorySelectors.selectCategoriesByType(type));
  }

  getCategoryById(id: string): Observable<Category | undefined> {
    return this.store.select(CategorySelectors.selectCategoryById(id));
  }

  getChildCategories(parentId: string): Observable<Category[]> {
    return this.store.select(CategorySelectors.selectChildCategories(parentId));
  }

  canDeleteCategory(category: Category): boolean {
    // Add business logic for when a category can be deleted
    // For example, categories with child categories might not be deletable
    return (category.childCount || 0) === 0;
  }

  // Helper methods for checking operation states
  getOperationState(operation: string): Observable<{ isLoading: boolean; error: string | null; hasError: boolean }> {
    return this.store.select(CategorySelectors.selectCategoryOperationState(operation));
  }

  hasOperationError(operation: string): Observable<boolean> {
    return this.store.select(CategorySelectors.selectHasOperationError(operation));
  }
}
