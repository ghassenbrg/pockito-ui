import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { 
  WalletRequest, 
  Wallet, 
  WalletList, 
  ReorderWalletsRequest, 
  WalletType 
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  private readonly baseUrl = '/api/wallets';

  constructor(private http: HttpClient) {}

  /**
   * Get all wallets for the current user
   */
  getUserWallets(): Observable<WalletList> {
    return this.http.get<WalletList>(this.baseUrl);
  }

  /**
   * Create a new wallet
   */
  createWallet(wallet: WalletRequest): Observable<Wallet> {
    return this.http.post<Wallet>(this.baseUrl, wallet);
  }

  /**
   * Get a specific wallet by ID
   */
  getWallet(walletId: string): Observable<Wallet> {
    return this.http.get<Wallet>(`${this.baseUrl}/${walletId}`);
  }

  /**
   * Update a wallet
   */
  updateWallet(walletId: string, wallet: WalletRequest): Observable<Wallet> {
    return this.http.put<Wallet>(`${this.baseUrl}/${walletId}`, wallet);
  }

  /**
   * Delete a wallet
   */
  deleteWallet(walletId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${walletId}`);
  }

  /**
   * Set a wallet as default
   */
  setDefaultWallet(walletId: string): Observable<Wallet> {
    return this.http.post<Wallet>(
      `${this.baseUrl}/${walletId}/set-default`,
      {}
    );
  }

  /**
   * Get the default wallet
   */
  getDefaultWallet(): Observable<Wallet> {
    return this.http.get<Wallet>(`${this.baseUrl}/default`);
  }

  /**
   * Get wallets by type
   */
  getWalletsByType(type: WalletType): Observable<WalletList> {
    return this.http.get<WalletList>(`${this.baseUrl}/type/${type}`);
  }

  /**
   * Reorder wallets
   */
  reorderWallets(request: ReorderWalletsRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/reorder`, request);
  }
}
