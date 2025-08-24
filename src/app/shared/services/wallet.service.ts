import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  Wallet, 
  CreateWalletRequest, 
  UpdateWalletRequest 
} from '../models/wallet.model';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private readonly baseUrl = `${environment.api.baseUrl}/wallets`;

  constructor(private http: HttpClient) {}

  /**
   * Get all wallets for the current user
   */
  getWallets(): Observable<Wallet[]> {
    return this.http.get<Wallet[]>(this.baseUrl);
  }

  /**
   * Get a specific wallet by ID
   */
  getWallet(id: string): Observable<Wallet> {
    return this.http.get<Wallet>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create a new wallet
   */
  createWallet(wallet: CreateWalletRequest): Observable<Wallet> {
    return this.http.post<Wallet>(this.baseUrl, wallet);
  }

  /**
   * Update an existing wallet
   */
  updateWallet(id: string, wallet: UpdateWalletRequest): Observable<Wallet> {
    return this.http.put<Wallet>(`${this.baseUrl}/${id}`, wallet);
  }

  /**
   * Set a wallet as default
   */
  setDefaultWallet(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/default`, {});
  }

  /**
   * Archive a wallet (soft delete)
   */
  archiveWallet(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/archive`, {});
  }

  /**
   * Activate a previously archived wallet
   */
  activateWallet(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/activate`, {});
  }

  /**
   * Reorder a wallet to a new position
   */
  reorderWallet(id: string, newOrder: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/reorder`, null, {
      params: { newOrder: newOrder.toString() }
    }).pipe(
      catchError(error => {
        throw new Error(error.error?.message || 'Failed to reorder wallet');
      })
    );
  }

  /**
   * Normalize display orders for all wallets
   */
  normalizeDisplayOrders(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/normalize-orders`, null).pipe(
      catchError(error => {
        throw new Error(error.error?.message || 'Failed to normalize display orders');
      })
    );
  }

  /**
   * Delete a wallet permanently (hard delete)
   * Note: This is not in the OpenAPI spec but might be useful for admin purposes
   */
  deleteWallet(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
