import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PaginatedResponse } from '@api/model/common.model';
import {
    CreateTransactionRequest,
    Pageable,
    TransactionDto,
    TransactionListParams,
    TransactionType,
    UpdateTransactionRequest,
} from '@api/model/transaction.model';
import { environment } from '@environments/environment';
import { ToastService } from '@shared/services/toast.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private readonly baseUrl = `${environment.api.baseUrl}/transactions`;

  private transactionsSubject = new BehaviorSubject<TransactionDto[]>([]);
  public transactions$ = this.transactionsSubject.asObservable();

  constructor(private http: HttpClient, private toastService: ToastService) {}

  // API Methods (following backend TransactionController endpoints)

  /**
   * Create a new transaction
   * POST /api/transactions
   */
  createTransaction(
    transaction: CreateTransactionRequest
  ): Observable<TransactionDto> {
    return this.http.post<TransactionDto>(`${this.baseUrl}`, transaction).pipe(
      tap(() => {
        // NgRx handles state management, so we just show success toast
        this.toastService.showSuccess('transactionCreated');
      }),
      catchError((error) => {
        console.error('Error creating transaction:', error);
        throw error; // Re-throw error for component handling
      })
    );
  }

  /**
   * Update an existing transaction
   * PUT /api/transactions/{transactionId}
   */
  updateTransaction(
    transactionId: string,
    transaction: UpdateTransactionRequest
  ): Observable<TransactionDto> {
    return this.http
      .put<TransactionDto>(`${this.baseUrl}/${transactionId}`, transaction)
      .pipe(
        tap(() => {
          // NgRx handles state management, so we just show success toast
          this.toastService.showSuccess('transactionUpdated');
        }),
        catchError((error) => {
          console.error(`Error updating transaction ${transactionId}:`, error);
          throw error; // Re-throw error for component handling
        })
      );
  }

  /**
   * Get transaction by ID
   * GET /api/transactions/{transactionId}
   */
  getTransaction(transactionId: string): Observable<TransactionDto> {
    return this.http
      .get<TransactionDto>(`${this.baseUrl}/${transactionId}`)
      .pipe(
        catchError((error) => {
          console.error(`Error fetching transaction ${transactionId}:`, error);
          throw error; // Re-throw error for component handling
        })
      );
  }

  /**
   * Delete a transaction
   * DELETE /api/transactions/{transactionId}
   */
  deleteTransaction(transactionId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${transactionId}`).pipe(
      tap(() => {
        // NgRx handles state management, so we just show success toast
        this.toastService.showSuccess('transactionDeleted');
      }),
      catchError((error) => {
        console.error(`Error deleting transaction ${transactionId}:`, error);
        throw error; // Re-throw error for component handling
      })
    );
  }

  /**
   * List transactions by criteria with pagination
   * GET /api/transactions
   */
  listTransactions(
    params?: TransactionListParams
  ): Observable<PaginatedResponse<TransactionDto>> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.walletId) {
        httpParams = httpParams.set('walletId', params.walletId);
      }
      if (params.startDate) {
        httpParams = httpParams.set('startDate', params.startDate);
      }
      if (params.endDate) {
        httpParams = httpParams.set('endDate', params.endDate);
      }
      if (params.transactionType) {
        httpParams = httpParams.set('transactionType', params.transactionType);
      }
      if (params.page !== undefined) {
        httpParams = httpParams.set('page', params.page.toString());
      }
      if (params.size !== undefined) {
        httpParams = httpParams.set('size', params.size.toString());
      }
      if (params.sort) {
        httpParams = httpParams.set('sort', params.sort);
      }
    }

    return this.http
      .get<PaginatedResponse<TransactionDto>>(`${this.baseUrl}`, {
        params: httpParams,
      })
      .pipe(
        catchError((error) => {
          console.error('Error listing transactions:', error);
          throw error; // Re-throw error for component handling
        })
      );
  }

  /**
   * Get all transactions for the authenticated user (without pagination)
   * GET /api/transactions/all
   */
  getAllTransactions(): Observable<TransactionDto[]> {
    return this.http.get<TransactionDto[]>(`${this.baseUrl}/all`).pipe(
      tap((transactions) => this.transactionsSubject.next(transactions)),
      catchError((error) => {
        console.error('Error fetching all transactions:', error);
        throw error; // Re-throw error for component handling
      })
    );
  }

  /**
   * Get transactions for a specific wallet with pagination
   * GET /api/transactions/wallet/{walletId}
   */
  getTransactionsByWallet(
    walletId: string,
    pageable?: Pageable
  ): Observable<PaginatedResponse<TransactionDto>> {
    let httpParams = new HttpParams();

    if (pageable) {
      if (pageable.page !== undefined) {
        httpParams = httpParams.set('page', pageable.page.toString());
      }
      if (pageable.size !== undefined) {
        httpParams = httpParams.set('size', pageable.size.toString());
      }
      if (pageable.sort) {
        httpParams = httpParams.set('sort', pageable.sort);
      }
    }

    return this.http
      .get<PaginatedResponse<TransactionDto>>(
        `${this.baseUrl}/wallet/${walletId}`,
        { params: httpParams }
      )
      .pipe(
        catchError((error) => {
          console.error(
            `Error fetching transactions for wallet ${walletId}:`,
            error
          );
          throw error; // Re-throw error for component handling
        })
      );
  }

  /**
   * Get transactions by date range with pagination
   * GET /api/transactions/date-range
   */
  getTransactionsByDateRange(
    startDate: string,
    endDate: string,
    pageable?: Pageable
  ): Observable<PaginatedResponse<TransactionDto>> {
    let httpParams = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    if (pageable) {
      if (pageable.page !== undefined) {
        httpParams = httpParams.set('page', pageable.page.toString());
      }
      if (pageable.size !== undefined) {
        httpParams = httpParams.set('size', pageable.size.toString());
      }
      if (pageable.sort) {
        httpParams = httpParams.set('sort', pageable.sort);
      }
    }

    return this.http
      .get<PaginatedResponse<TransactionDto>>(`${this.baseUrl}/date-range`, {
        params: httpParams,
      })
      .pipe(
        catchError((error) => {
          console.error(
            `Error fetching transactions by date range ${startDate} to ${endDate}:`,
            error
          );
          throw error; // Re-throw error for component handling
        })
      );
  }

  /**
   * Get transactions by type with pagination
   * GET /api/transactions/type/{transactionType}
   */
  getTransactionsByType(
    transactionType: TransactionType,
    pageable?: Pageable
  ): Observable<PaginatedResponse<TransactionDto>> {
    let httpParams = new HttpParams();

    if (pageable) {
      if (pageable.page !== undefined) {
        httpParams = httpParams.set('page', pageable.page.toString());
      }
      if (pageable.size !== undefined) {
        httpParams = httpParams.set('size', pageable.size.toString());
      }
      if (pageable.sort) {
        httpParams = httpParams.set('sort', pageable.sort);
      }
    }

    return this.http
      .get<PaginatedResponse<TransactionDto>>(
        `${this.baseUrl}/type/${transactionType}`,
        { params: httpParams }
      )
      .pipe(
        catchError((error) => {
          console.error(
            `Error fetching transactions by type ${transactionType}:`,
            error
          );
          throw error; // Re-throw error for component handling
        })
      );
  }

  // Legacy methods for backward compatibility

  /**
   * Get all transactions (legacy method)
   */
  getAllUserTransactions(): Observable<TransactionDto[]> {
    return this.transactions$;
  }

  /**
   * Get transaction by ID (legacy method)
   */
  getTransactionById(id: string): Observable<TransactionDto | undefined> {
    return new Observable((observer) => {
      this.transactions$.subscribe((transactions) => {
        const transaction = transactions.find((t) => t.id === id);
        observer.next(transaction);
        observer.complete();
      });
    });
  }

  // Utility methods

  /**
   * Calculate wallet to amount based on amount and exchange rate
   */
  calculateWalletToAmount(amount: number, exchangeRate: number): number {
    return amount * exchangeRate;
  }

  /**
   * Format transaction type for display
   */
  formatTransactionType(type: TransactionType): string {
    switch (type) {
      case 'EXPENSE':
        return 'Expense';
      case 'INCOME':
        return 'Income';
      case 'TRANSFER':
        return 'Transfer';
      default:
        return type;
    }
  }

  /**
   * Get transaction type color for UI
   */
  getTransactionTypeColor(type: TransactionType): string {
    switch (type) {
      case 'EXPENSE':
        return '#ef4444'; // red-500
      case 'INCOME':
        return '#10b981'; // emerald-500
      case 'TRANSFER':
        return '#3b82f6'; // blue-500
      default:
        return '#6b7280'; // gray-500
    }
  }

  /**
   * Check if transaction is an expense
   */
  isExpense(transaction: TransactionDto): boolean {
    return transaction.transactionType === 'EXPENSE';
  }

  /**
   * Check if transaction is an income
   */
  isIncome(transaction: TransactionDto): boolean {
    return transaction.transactionType === 'INCOME';
  }

  /**
   * Check if transaction is a transfer
   */
  isTransfer(transaction: TransactionDto): boolean {
    return transaction.transactionType === 'TRANSFER';
  }
}
