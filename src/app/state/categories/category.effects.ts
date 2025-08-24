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

@Injectable()
export class CategoryEffects {

  // Mock data for development - replace with actual API service
  private mockCategories: Category[] = [
    {
      id: '1',
      userId: 'user1',
      type: 'EXPENSE',
      name: 'Food & Dining',
      color: '#FF6B6B',
      iconType: 'EMOJI',
      iconValue: '🍕',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      userId: 'user1',
      type: 'EXPENSE',
      name: 'Transportation',
      color: '#4ECDC4',
      iconType: 'EMOJI',
      iconValue: '🚗',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      userId: 'user1',
      type: 'EXPENSE',
      name: 'Shopping',
      color: '#45B7D1',
      iconType: 'EMOJI',
      iconValue: '🛍️',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '4',
      userId: 'user1',
      type: 'INCOME',
      name: 'Salary',
      color: '#96CEB4',
      iconType: 'EMOJI',
      iconValue: '💰',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '5',
      userId: 'user1',
      type: 'INCOME',
      name: 'Freelance',
      color: '#FFEAA7',
      iconType: 'EMOJI',
      iconValue: '💼',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  loadCategories$ = createEffect(() => this.actions$.pipe(
    ofType(loadCategories),
    mergeMap(() => of(this.mockCategories).pipe(
      map(categories => loadCategoriesSuccess({ categories })),
      catchError(error => of(loadCategoriesFailure({ error: error.message })))
    ))
  ));

  loadCategory$ = createEffect(() => this.actions$.pipe(
    ofType(loadCategory),
    mergeMap(({ id }) => {
      const category = this.mockCategories.find(c => c.id === id);
      if (category) {
        return of(loadCategorySuccess({ category }));
      } else {
        return of(loadCategoryFailure({ error: 'Category not found' }));
      }
    })
  ));

  createCategory$ = createEffect(() => this.actions$.pipe(
    ofType(createCategory),
    mergeMap(({ category }) => {
      const newCategory: Category = {
        ...category,
        id: Date.now().toString(),
        userId: 'user1', // Mock user ID
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Add to mock data
      this.mockCategories.push(newCategory);
      
      return of(createCategorySuccess({ category: newCategory })).pipe(
        tap(() => {
          this.store.dispatch(raise({
            message: 'Category created successfully!',
            status: 200,
            displayType: 'toast',
            notificationType: 'success'
          }));
        })
      );
    })
  ));

  updateCategory$ = createEffect(() => this.actions$.pipe(
    ofType(updateCategory),
    mergeMap(({ id, category }) => {
      const index = this.mockCategories.findIndex(c => c.id === id);
      if (index !== -1) {
        const updatedCategory: Category = {
          ...this.mockCategories[index],
          ...category,
          updatedAt: new Date().toISOString()
        };
        
        // Update mock data
        this.mockCategories[index] = updatedCategory;
        
        return of(updateCategorySuccess({ category: updatedCategory })).pipe(
          tap(() => {
            this.store.dispatch(raise({
              message: 'Category updated successfully!',
              status: 200,
              displayType: 'toast',
              notificationType: 'success'
            }));
          })
        );
      } else {
        return of(updateCategoryFailure({ error: 'Category not found' }));
      }
    })
  ));

  archiveCategory$ = createEffect(() => this.actions$.pipe(
    ofType(archiveCategory),
    mergeMap(({ id }) => {
      const index = this.mockCategories.findIndex(c => c.id === id);
      if (index !== -1) {
        // Remove from mock data
        this.mockCategories.splice(index, 1);
        
        return of(archiveCategorySuccess({ categoryId: id })).pipe(
          tap(() => {
            this.store.dispatch(raise({
              message: 'Category archived successfully!',
              status: 200,
              displayType: 'toast',
              notificationType: 'success'
            }));
          })
        );
      } else {
        return of(archiveCategoryFailure({ error: 'Category not found' }));
      }
    }))
  );

  activateCategory$ = createEffect(() => this.actions$.pipe(
    ofType(activateCategory),
    mergeMap(({ id }) => {
      // For now, just return success - in real app, you'd restore from archived state
      const mockCategory: Category = {
        id,
        userId: 'user1',
        type: 'EXPENSE',
        name: 'Restored Category',
        color: '#6B73FF',
        iconType: 'EMOJI',
        iconValue: '🔄',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return of(activateCategorySuccess({ category: mockCategory })).pipe(
        tap(() => {
          this.store.dispatch(raise({
            message: 'Category activated successfully!',
            status: 200,
            displayType: 'toast',
            notificationType: 'success'
          }));
        })
      );
    }))
  );

  constructor(
    private actions$: Actions,
    private store: Store
  ) {}
}
