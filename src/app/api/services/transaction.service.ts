import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  TransactionRequest, 
  Transaction, 
  TransactionDto, 
  TransactionList,
  TransactionType, 
  Pageable, 
  PageTransactionDto 
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private readonly baseUrl = '/api/transactions';

  constructor(private http: HttpClient) {}

  /**
   * List transactions by criteria with pagination
   */
  listTransactions(
    pageable: Pageable,
    walletId?: string,
    startDate?: string,
    endDate?: string,
    transactionType?: TransactionType
  ): Observable<PageTransactionDto> {
    let params = new HttpParams();
    
    // Add pageable parameters
    if (pageable.page !== undefined) {
      params = params.set('page', pageable.page.toString());
    }
    if (pageable.size !== undefined) {
      params = params.set('size', pageable.size.toString());
    }
    if (pageable.sort) {
      pageable.sort.forEach(sort => {
        params = params.append('sort', sort);
      });
    }

    // Add filter parameters
    if (walletId) {
      params = params.set('walletId', walletId);
    }
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    if (transactionType) {
      params = params.set('transactionType', transactionType);
    }

    return this.http.get<PageTransactionDto>(this.baseUrl, { params });
  }

  /**
   * Create a new transaction
   */
  createTransaction(transaction: TransactionRequest): Observable<Transaction> {
    return this.http.post<Transaction>(this.baseUrl, transaction);
  }

  /**
   * Get a specific transaction by ID
   */
  getTransaction(transactionId: string): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.baseUrl}/${transactionId}`);
  }

  /**
   * Update an existing transaction
   */
  updateTransaction(transactionId: string, transaction: TransactionRequest): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.baseUrl}/${transactionId}`, transaction);
  }

  /**
   * Delete a transaction
   */
  deleteTransaction(transactionId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${transactionId}`);
  }

  /**
   * Get transactions by wallet with pagination
   */
  getTransactionsByWallet(walletId: string, pageable: Pageable): Observable<PageTransactionDto> {
    let params = new HttpParams();
    
    if (pageable.page !== undefined) {
      params = params.set('page', pageable.page.toString());
    }
    if (pageable.size !== undefined) {
      params = params.set('size', pageable.size.toString());
    }
    if (pageable.sort) {
      pageable.sort.forEach(sort => {
        params = params.append('sort', sort);
      });
    }

    return this.http.get<PageTransactionDto>(`${this.baseUrl}/wallet/${walletId}`, { params });
  }

  /**
   * Get transactions by type with pagination
   */
  getTransactionsByType(transactionType: TransactionType, pageable: Pageable): Observable<PageTransactionDto> {
    let params = new HttpParams();
    
    if (pageable.page !== undefined) {
      params = params.set('page', pageable.page.toString());
    }
    if (pageable.size !== undefined) {
      params = params.set('size', pageable.size.toString());
    }
    if (pageable.sort) {
      pageable.sort.forEach(sort => {
        params = params.append('sort', sort);
      });
    }

    return this.http.get<PageTransactionDto>(`${this.baseUrl}/type/${transactionType}`, { params });
  }

  /**
   * Get transactions by date range with pagination
   */
  getTransactionsByDateRange(startDate: string, endDate: string, pageable: Pageable): Observable<PageTransactionDto> {
    let params = new HttpParams();
    
    params = params.set('startDate', startDate);
    params = params.set('endDate', endDate);
    
    if (pageable.page !== undefined) {
      params = params.set('page', pageable.page.toString());
    }
    if (pageable.size !== undefined) {
      params = params.set('size', pageable.size.toString());
    }
    if (pageable.sort) {
      pageable.sort.forEach(sort => {
        params = params.append('sort', sort);
      });
    }

    return this.http.get<PageTransactionDto>(`${this.baseUrl}/date-range`, { params });
  }

  /**
   * Get all transactions for the current user (without pagination)
   * Use with caution for users with large transaction volumes
   */
  getAllTransactions(): Observable<TransactionList> {
    return this.http.get<TransactionList>(`${this.baseUrl}/all`);
  }
}
