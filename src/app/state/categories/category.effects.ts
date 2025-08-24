import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import { 
  loadCategories, 
  loadCategoriesSuccess, 
  loadCategoriesFailure,
  loadCategory,
  loadCategorySuccess,
  loadCategoryFailure,
  createCategory,
  createCategorySuccess,
  createCategoryFailure,
  updateCategory,
  updateCategorySuccess,
  updateCategoryFailure,
  archiveCategory,
  archiveCategorySuccess,
  archiveCategoryFailure,
  activateCategory,
  activateCategorySuccess,
  activateCategoryFailure
} from './category.actions';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@shared/models';
import { raise } from '../notification/notification.actions';
import { CategoryService } from '../../services/category.service';

@Injectable()
export class CategoryEffects {

  constructor(
    private actions$: Actions,
    private store: Store,
    private categoryService: CategoryService
  ) {}

  loadCategories$ = createEffect(() => this.actions$.pipe(
    ofType(loadCategories),
    mergeMap(() => this.categoryService.getCategories().pipe(
      map(categories => loadCategoriesSuccess({ categories })),
      catchError(error => of(loadCategoriesFailure({ error: error.message || 'Failed to load categories' })))
    ))
  ));

  loadCategory$ = createEffect(() => this.actions$.pipe(
    ofType(loadCategory),
    mergeMap(({ id }) => this.categoryService.getCategory(id).pipe(
      map(category => loadCategorySuccess({ category })),
      catchError(error => of(loadCategoryFailure({ error: error.message || 'Failed to load category' })))
    ))
  ));

  createCategory$ = createEffect(() => this.actions$.pipe(
    ofType(createCategory),
    mergeMap(({ category }) => this.categoryService.createCategory(category).pipe(
      map(newCategory => createCategorySuccess({ category: newCategory })),
      tap(() => {
        this.store.dispatch(raise({
          message: 'Category created successfully!',
          status: 200,
          displayType: 'toast',
          notificationType: 'success'
        }));
      }),
      catchError(error => of(createCategoryFailure({ error: error.message || 'Failed to create category' })))
    ))
  ));

  updateCategory$ = createEffect(() => this.actions$.pipe(
    ofType(updateCategory),
    mergeMap(({ id, category }) => this.categoryService.updateCategory(id, category).pipe(
      map(updatedCategory => updateCategorySuccess({ category: updatedCategory })),
      tap(() => {
        this.store.dispatch(raise({
          message: 'Category updated successfully!',
          status: 200,
          displayType: 'toast',
          notificationType: 'success'
        }));
      }),
      catchError(error => of(updateCategoryFailure({ error: error.message || 'Failed to update category' })))
    ))
  ));

  archiveCategory$ = createEffect(() => this.actions$.pipe(
    ofType(archiveCategory),
    mergeMap(({ id }) => this.categoryService.archiveCategory(id).pipe(
      map(() => archiveCategorySuccess({ categoryId: id })),
      tap(() => {
        this.store.dispatch(raise({
          message: 'Category archived successfully!',
          status: 200,
          displayType: 'toast',
          notificationType: 'success'
        }));
      }),
      catchError(error => of(archiveCategoryFailure({ error: error.message || 'Failed to archive category' })))
    ))
  ));

  activateCategory$ = createEffect(() => this.actions$.pipe(
    ofType(activateCategory),
    mergeMap(({ id }) => this.categoryService.activateCategory(id).pipe(
      map(() => {
        // Since the API doesn't return the updated category, we'll need to reload it
        // For now, we'll dispatch a load action to refresh the data
        this.store.dispatch(loadCategories());
        return activateCategorySuccess({ categoryId: id });
      }),
      tap(() => {
        this.store.dispatch(raise({
          message: 'Category activated successfully!',
          status: 200,
          displayType: 'toast',
          notificationType: 'success'
        }));
      }),
      catchError(error => of(activateCategoryFailure({ error: error.message || 'Failed to activate category' })))
    ))
  ));
}
