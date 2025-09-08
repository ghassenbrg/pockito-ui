import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CategoryApiService } from '@api/services/category.service';
import * as CategoryActions from './category.actions';

@Injectable()
export class CategoryEffects {
  constructor(
    private actions$: Actions,
    private categoryService: CategoryApiService,
    private store: Store,
    private router: Router
  ) {}

  // Load Categories Effect
  loadCategories$ = createEffect(() => this.actions$.pipe(
    ofType(CategoryActions.loadCategories),
    mergeMap(() => this.categoryService.getUserCategories()
      .pipe(
        map(categories => CategoryActions.loadCategoriesSuccess({ categories })),
        catchError(error => of(CategoryActions.loadCategoriesFailure({ 
          error: error.message || 'Failed to load categories' 
        })))
      ))
  ));

  // Load Single Category by ID Effect
  loadCategoryById$ = createEffect(() => this.actions$.pipe(
    ofType(CategoryActions.loadCategoryById),
    mergeMap(({ categoryId }) => this.categoryService.getCategory(categoryId)
      .pipe(
        map(category => CategoryActions.loadCategoryByIdSuccess({ category })),
        catchError(error => of(CategoryActions.loadCategoryByIdFailure({ 
          error: error.message || 'Failed to load category' 
        })))
      ))
  ));

  // Create Category Effect
  createCategory$ = createEffect(() => this.actions$.pipe(
    ofType(CategoryActions.createCategory),
    mergeMap(({ categoryData }) => this.categoryService.createCategory(categoryData)
      .pipe(
        map(category => CategoryActions.createCategorySuccess({ category })),
        catchError(error => of(CategoryActions.createCategoryFailure({ 
          error: error.message || 'Failed to create category' 
        })))
      ))
  ));

  // Update Category Effect
  updateCategory$ = createEffect(() => this.actions$.pipe(
    ofType(CategoryActions.updateCategory),
    mergeMap(({ categoryId, categoryData }) => this.categoryService.updateCategory(categoryId, categoryData)
      .pipe(
        map(category => CategoryActions.updateCategorySuccess({ category })),
        catchError(error => of(CategoryActions.updateCategoryFailure({ 
          error: error.message || 'Failed to update category' 
        })))
      ))
  ));

  // Delete Category Effect
  deleteCategory$ = createEffect(() => this.actions$.pipe(
    ofType(CategoryActions.deleteCategory),
    mergeMap(({ category }) => {
      if (this.confirmDeletion(category.name)) {
        return this.categoryService.deleteCategory(category.id).pipe(
          map(() => CategoryActions.deleteCategorySuccess({ categoryId: category.id })),
          catchError(error => of(CategoryActions.deleteCategoryFailure({ 
            error: error.message || 'Failed to delete category' 
          })))
        );
      } else {
        return of(CategoryActions.deleteCategoryFailure({ 
          error: 'Deletion cancelled' 
        }));
      }
    })
  ));

  // Navigation effects for successful operations
  createCategorySuccess$ = createEffect(() => this.actions$.pipe(
    ofType(CategoryActions.createCategorySuccess),
    tap(() => {
      // Navigate to categories list after successful creation
      setTimeout(() => this.router.navigate(['/app/categories']), 300);
    })
  ), { dispatch: false });

  updateCategorySuccess$ = createEffect(() => this.actions$.pipe(
    ofType(CategoryActions.updateCategorySuccess),
    tap(() => {
      // Navigate to categories list after successful update
      setTimeout(() => this.router.navigate(['/app/categories']), 300);
    })
  ), { dispatch: false });

  deleteCategorySuccess$ = createEffect(() => this.actions$.pipe(
    ofType(CategoryActions.deleteCategorySuccess),
    tap(() => {
      // Navigate to categories list after successful deletion
      setTimeout(() => this.router.navigate(['/app/categories']), 300);
    })
  ), { dispatch: false });

  private confirmDeletion(categoryName: string): boolean {
    return confirm(`Are you sure you want to delete ${categoryName}?`);
  }
}
