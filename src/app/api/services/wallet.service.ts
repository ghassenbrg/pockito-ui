import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ReorderWalletsRequest, WalletDto, WalletType } from '../models';

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  private readonly baseUrl = '/api/wallets';

  constructor(private http: HttpClient) {}

  /**
   * Get all wallets for the current user
   */
  getUserWallets(): Observable<WalletDto[]> {
    return this.http.get<WalletDto[]>(this.baseUrl);
  }

  /**
   * Create a new wallet
   */
  createWallet(wallet: WalletDto): Observable<WalletDto> {
    return this.http.post<WalletDto>(this.baseUrl, wallet);
  }

  /**
   * Get a specific wallet by ID
   */
  getWallet(walletId: string): Observable<WalletDto> {
    return this.http.get<WalletDto>(`${this.baseUrl}/${walletId}`);
  }

  /**
   * Update a wallet
   */
  updateWallet(walletId: string, wallet: WalletDto): Observable<WalletDto> {
    return this.http.put<WalletDto>(`${this.baseUrl}/${walletId}`, wallet);
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
  setDefaultWallet(walletId: string): Observable<WalletDto> {
    return this.http.post<WalletDto>(
      `${this.baseUrl}/${walletId}/set-default`,
      {}
    );
  }

  /**
   * Get the default wallet
   */
  getDefaultWallet(): Observable<WalletDto> {
    return this.http.get<WalletDto>(`${this.baseUrl}/default`);
  }

  /**
   * Get wallets by type
   */
  getWalletsByType(type: WalletType): Observable<WalletDto[]> {
    return this.http.get<WalletDto[]>(`${this.baseUrl}/type/${type}`);
  }

  /**
   * Reorder wallets
   */
  reorderWallets(request: ReorderWalletsRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/reorder`, request);
  }
}
