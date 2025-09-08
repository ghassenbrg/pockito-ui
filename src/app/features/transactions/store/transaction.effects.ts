import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap, withLatestFrom } from 'rxjs/operators';
import { Router } from '@angular/router';
import { TransactionService } from '@api/services/transaction.service';
import * as TransactionActions from './transaction.actions';
import * as TransactionSelectors from './transaction.selectors';

@Injectable()
export class TransactionEffects {
  constructor(
    private actions$: Actions,
    private transactionService: TransactionService,
    private store: Store,
    private router: Router
  ) {}

  // Load Transactions Effect
  loadTransactions$ = createEffect(() => this.actions$.pipe(
    ofType(TransactionActions.loadTransactions),
    withLatestFrom(
      this.store.select(TransactionSelectors.selectFilters),
      this.store.select(TransactionSelectors.selectCurrentPage),
      this.store.select(TransactionSelectors.selectPageSize)
    ),
    mergeMap(([action, filters, currentPage, pageSize]) => {
      const params = {
        ...action.params,
        ...filters,
        page: currentPage,
        size: pageSize,
        sort: 'effectiveDate,desc'
      };
      
      return this.transactionService.listTransactions(params).pipe(
        map(response => TransactionActions.loadTransactionsSuccess({
          transactions: response.content || [],
          totalElements: response.totalElements || 0,
          totalPages: response.totalPages || 0,
          currentPage: response.number || 0,
          pageSize: response.size || 10,
        })),
        catchError(error => of(TransactionActions.loadTransactionsFailure({ 
          error: error.message || 'Failed to load transactions' 
        })))
      );
    })
  ));

  // Load Single Transaction by ID Effect
  loadTransactionById$ = createEffect(() => this.actions$.pipe(
    ofType(TransactionActions.loadTransactionById),
    mergeMap(({ transactionId }) => this.transactionService.getTransactionById(transactionId).pipe(
      map(transaction => {
        if (transaction) {
          return TransactionActions.loadTransactionByIdSuccess({ transaction });
        } else {
          return TransactionActions.loadTransactionByIdFailure({ 
            error: 'Transaction not found' 
          });
        }
      }),
      catchError(error => of(TransactionActions.loadTransactionByIdFailure({ 
        error: error.message || 'Failed to load transaction' 
      })))
    ))
  ));

  // Create Transaction Effect
  createTransaction$ = createEffect(() => this.actions$.pipe(
    ofType(TransactionActions.createTransaction),
    mergeMap(({ transactionData }) => this.transactionService.createTransaction(transactionData).pipe(
      map(transaction => TransactionActions.createTransactionSuccess({ transaction })),
      catchError(error => of(TransactionActions.createTransactionFailure({ 
        error: error.message || 'Failed to create transaction' 
      })))
    ))
  ));

  // Update Transaction Effect
  updateTransaction$ = createEffect(() => this.actions$.pipe(
    ofType(TransactionActions.updateTransaction),
    mergeMap(({ transactionId, transactionData }) => 
      this.transactionService.updateTransaction(transactionId, transactionData).pipe(
        map(transaction => TransactionActions.updateTransactionSuccess({ transaction })),
        catchError(error => of(TransactionActions.updateTransactionFailure({ 
          error: error.message || 'Failed to update transaction' 
        })))
      )
    )
  ));

  // Delete Transaction Effect
  deleteTransaction$ = createEffect(() => this.actions$.pipe(
    ofType(TransactionActions.deleteTransaction),
    mergeMap(({ transaction }) => {
      if (this.confirmDeletion(transaction.transactionType, transaction.amount)) {
        return this.transactionService.deleteTransaction(transaction.id!).pipe(
          map(() => TransactionActions.deleteTransactionSuccess({ transactionId: transaction.id! })),
          catchError(error => of(TransactionActions.deleteTransactionFailure({ 
            error: error.message || 'Failed to delete transaction' 
          })))
        );
      } else {
        return of(TransactionActions.deleteTransactionFailure({ 
          error: 'Deletion cancelled' 
        }));
      }
    })
  ));

  // Auto-reload transactions after successful operations
  createTransactionSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(TransactionActions.createTransactionSuccess),
    tap(() => {
      // Reload transactions to get updated list
      this.store.dispatch(TransactionActions.loadTransactions({}));
    })
  ), { dispatch: false });

  updateTransactionSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(TransactionActions.updateTransactionSuccess),
    tap(() => {
      // Reload transactions to get updated list
      this.store.dispatch(TransactionActions.loadTransactions({}));
    })
  ), { dispatch: false });

  deleteTransactionSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(TransactionActions.deleteTransactionSuccess),
    tap(() => {
      // Reload transactions to get updated list
      this.store.dispatch(TransactionActions.loadTransactions({}));
    })
  ), { dispatch: false });

  // Handle filter changes - reload transactions
  setFilters$ = createEffect(() => this.actions$.pipe(
    ofType(TransactionActions.setFilters),
    tap(() => {
      this.store.dispatch(TransactionActions.loadTransactions({}));
    })
  ), { dispatch: false });

  clearFilters$ = createEffect(() => this.actions$.pipe(
    ofType(TransactionActions.clearFilters),
    tap(() => {
      this.store.dispatch(TransactionActions.loadTransactions({}));
    })
  ), { dispatch: false });

  updateFilter$ = createEffect(() => this.actions$.pipe(
    ofType(TransactionActions.updateFilter),
    tap(() => {
      this.store.dispatch(TransactionActions.loadTransactions({}));
    })
  ), { dispatch: false });

  // Handle pagination changes - reload transactions
  setCurrentPage$ = createEffect(() => this.actions$.pipe(
    ofType(TransactionActions.setCurrentPage),
    tap(() => {
      this.store.dispatch(TransactionActions.loadTransactions({}));
    })
  ), { dispatch: false });

  setPageSize$ = createEffect(() => this.actions$.pipe(
    ofType(TransactionActions.setPageSize),
    tap(() => {
      this.store.dispatch(TransactionActions.loadTransactions({}));
    })
  ), { dispatch: false });

  nextPage$ = createEffect(() => this.actions$.pipe(
    ofType(TransactionActions.nextPage),
    tap(() => {
      this.store.dispatch(TransactionActions.loadTransactions({}));
    })
  ), { dispatch: false });

  previousPage$ = createEffect(() => this.actions$.pipe(
    ofType(TransactionActions.previousPage),
    tap(() => {
      this.store.dispatch(TransactionActions.loadTransactions({}));
    })
  ), { dispatch: false });

  firstPage$ = createEffect(() => this.actions$.pipe(
    ofType(TransactionActions.firstPage),
    tap(() => {
      this.store.dispatch(TransactionActions.loadTransactions({}));
    })
  ), { dispatch: false });

  lastPage$ = createEffect(() => this.actions$.pipe(
    ofType(TransactionActions.lastPage),
    tap(() => {
      this.store.dispatch(TransactionActions.loadTransactions({}));
    })
  ), { dispatch: false });

  private confirmDeletion(transactionType: string, amount: number): boolean {
    const typeLabel = this.getTransactionTypeLabel(transactionType);
    return confirm(`Are you sure you want to delete this ${typeLabel.toLowerCase()} transaction of $${amount}?`);
  }

  private getTransactionTypeLabel(type: string): string {
    switch (type) {
      case 'EXPENSE':
        return 'Expense';
      case 'INCOME':
        return 'Income';
      case 'TRANSFER':
        return 'Transfer';
      default:
        return 'Transaction';
    }
  }
}
