import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { WalletDto, WalletType } from '@api/model/wallet.model';
import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { ToastService } from '@shared/services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private readonly baseUrl = `${environment.api.baseUrl}/wallets`;

  private walletsSubject = new BehaviorSubject<WalletDto[]>([]);
  public wallets$ = this.walletsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private toastService: ToastService
  ) {}

  // API Methods (following OpenAPI specification)
  
  /**
   * Get user wallets
   */
  getUserWallets(): Observable<WalletDto[]> {
    return this.http.get<WalletDto[]>(`${this.baseUrl}`).pipe(
      tap(wallets => this.walletsSubject.next(wallets)),
      catchError(error => {
        console.error('Error fetching wallets:', error);
        throw error; // Re-throw error for component handling
      })
    );
  }

  /**
   * Get wallet by ID
   */
  getWallet(walletId: string): Observable<WalletDto> {
    return this.http.get<WalletDto>(`${this.baseUrl}/${walletId}`).pipe(
      catchError(error => {
        console.error(`Error fetching wallet ${walletId}:`, error);
        throw error; // Re-throw error for component handling
      })
    );
  }

  /**
   * Create wallet
   */
  createWallet(wallet: WalletDto): Observable<WalletDto> {
    return this.http.post<WalletDto>(`${this.baseUrl}`, wallet).pipe(
      tap(_newWallet => {
        // NgRx handles state management, so we just show success toast
        this.toastService.showSuccess('walletCreated');
      }),
      catchError(error => {
        console.error('Error creating wallet:', error);
        throw error; // Re-throw error for component handling
      })
    );
  }

  /**
   * Update wallet
   */
  updateWallet(walletId: string, wallet: WalletDto): Observable<WalletDto> {
    return this.http.put<WalletDto>(`${this.baseUrl}/${walletId}`, wallet).pipe(
      tap(_updatedWallet => {
        // NgRx handles state management, so we just show success toast
        this.toastService.showSuccess('walletUpdated');
      }),
      catchError(error => {
        console.error(`Error updating wallet ${walletId}:`, error);
        throw error; // Re-throw error for component handling
      })
    );
  }

  /**
   * Delete wallet
   */
  deleteWallet(walletId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${walletId}`).pipe(
      tap(() => {
        // NgRx handles state management, so we just show success toast
        this.toastService.showSuccess('walletDeleted');
      }),
      catchError(error => {
        console.error(`Error deleting wallet ${walletId}:`, error);
        throw error; // Re-throw error for component handling
      })
    );
  }

  /**
   * Set default wallet
   */
  setDefaultWallet(walletId: string): Observable<WalletDto> {
    return this.http.post<WalletDto>(`${this.baseUrl}/${walletId}/set-default`, {}).pipe(
      tap(() => {
        // NgRx handles state management, so we just show success toast
        this.toastService.showSuccess('defaultWalletSet');
      }),
      catchError(error => {
        console.error(`Error setting default wallet ${walletId}:`, error);
        throw error; // Re-throw error for component handling
      })
    );
  }

  /**
   * Reorder wallets
   */
  reorderWallets(walletIds: string[]): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/reorder`, { walletIds }).pipe(
      tap(() => {
        // NgRx handles state management, so we just show success toast
        this.toastService.showSuccess('walletsReordered');

      }),
      catchError(error => {
        console.error('Error reordering wallets:', error);
        throw error; // Re-throw error for component handling
      })
    );
  }

  /**
   * Get wallets by type
   */
  getWalletsByType(type: WalletType): Observable<WalletDto[]> {
    return this.http.get<WalletDto[]>(`${this.baseUrl}/type/${type}`).pipe(
      catchError(error => {
        console.error(`Error fetching wallets by type ${type}:`, error);
        throw error; // Re-throw error for component handling
      })
    );
  }

  /**
   * Get default wallet
   */
  getDefaultWallet(): Observable<WalletDto> {
    return this.http.get<WalletDto>(`${this.baseUrl}/default`).pipe(
      catchError(error => {
        console.error('Error fetching default wallet:', error);
        throw error; // Re-throw error for component handling
      })
    );
  }

  // Legacy methods for backward compatibility
  
  getAllWallets(): Observable<WalletDto[]> {
    return this.wallets$;
  }

  getWalletById(id: string): Observable<WalletDto | undefined> {
    return new Observable(observer => {
      this.wallets$.subscribe(wallets => {
        const wallet = wallets.find(w => w.id === id);
        observer.next(wallet);
        observer.complete();
      });
    });
  }

  getGoalProgress(wallet: WalletDto): number {
    if ((wallet.goalAmount ?? 0) <= 0) return 0;
    return Math.min((wallet.balance! / (wallet.goalAmount ?? 1)) * 100, 100);
  }

  // Reordering Methods - Now handled by NgRx effects using reorderWallets API
  // The old methods have been removed to avoid conflicts with NgRx state management
}
