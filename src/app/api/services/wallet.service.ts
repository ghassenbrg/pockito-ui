import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { WalletDto, WalletType } from '../model/wallet.model';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { ToastService } from '../../shared/services/toast.service';

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
        this.toastService.showHttpError(error, 'failedToLoadWallets');
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
        this.toastService.showHttpError(error, 'failedToLoadWallet');
        throw error; // Re-throw error for component handling
      })
    );
  }

  /**
   * Create wallet
   */
  createWallet(wallet: WalletDto): Observable<WalletDto> {
    return this.http.post<WalletDto>(`${this.baseUrl}`, wallet).pipe(
      tap(newWallet => {
        const currentWallets = this.walletsSubject.value;
        const updatedWallets = [...currentWallets, newWallet];
        this.walletsSubject.next(updatedWallets);
        this.updateWalletOrderPositions();
        this.toastService.showSuccess('walletCreated');
      }),
      catchError(error => {
        console.error('Error creating wallet:', error);
        this.toastService.showHttpError(error, 'failedToCreateWallet');
        throw error; // Re-throw error for component handling
      })
    );
  }

  /**
   * Update wallet
   */
  updateWallet(walletId: string, wallet: WalletDto): Observable<WalletDto> {
    return this.http.put<WalletDto>(`${this.baseUrl}/${walletId}`, wallet).pipe(
      tap(updatedWallet => {
        const currentWallets = this.walletsSubject.value;
        const walletIndex = currentWallets.findIndex(w => w.id === walletId);
        
        if (walletIndex !== -1) {
          currentWallets[walletIndex] = updatedWallet;
          this.walletsSubject.next([...currentWallets]);
        }
        this.toastService.showSuccess('walletUpdated');
      }),
      catchError(error => {
        console.error(`Error updating wallet ${walletId}:`, error);
        this.toastService.showHttpError(error, 'failedToUpdateWallet');
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
        const currentWallets = this.walletsSubject.value;
        const filteredWallets = currentWallets.filter(wallet => wallet.id !== walletId);
        this.walletsSubject.next(filteredWallets);
        this.updateWalletOrderPositions();
        this.toastService.showSuccess('walletDeleted');
      }),
      catchError(error => {
        console.error(`Error deleting wallet ${walletId}:`, error);
        this.toastService.showHttpError(error, 'failedToDeleteWallet');
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
        const currentWallets = this.walletsSubject.value;
        
        // Remove default from all wallets
        currentWallets.forEach(wallet => {
          wallet.isDefault = false;
        });
        
        // Set the specified wallet as default
        const targetWallet = currentWallets.find(wallet => wallet.id === walletId);
        if (targetWallet) {
          targetWallet.isDefault = true;
          this.walletsSubject.next([...currentWallets]);
        }
        this.toastService.showSuccess('defaultWalletSet');
      }),
      catchError(error => {
        console.error(`Error setting default wallet ${walletId}:`, error);
        this.toastService.showHttpError(error, 'failedToSetDefaultWallet');
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
        const currentWallets = this.walletsSubject.value;
        const reorderedWallets: WalletDto[] = [];
        
        // Reorder based on the provided order
        walletIds.forEach((id, index) => {
          const wallet = currentWallets.find(w => w.id === id);
          if (wallet) {
            wallet.orderPosition = index + 1;
            reorderedWallets.push(wallet);
          }
        });
        
        // Add any remaining wallets
        currentWallets.forEach(wallet => {
          if (!walletIds.includes(wallet.id!)) {
            wallet.orderPosition = reorderedWallets.length + 1;
            reorderedWallets.push(wallet);
          }
        });
        
        this.walletsSubject.next(reorderedWallets);
        this.toastService.showSuccess('walletsReordered');
      }),
      catchError(error => {
        console.error('Error reordering wallets:', error);
        this.toastService.showHttpError(error, 'failedToReorderWallets');
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
        this.toastService.showHttpError(error, 'failedToLoadWalletsByType');
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
        this.toastService.showHttpError(error, 'failedToLoadDefaultWallet');
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

  // Reordering Methods
  moveWalletUp(wallet: WalletDto): void {
    const currentWallets = this.walletsSubject.value;
    const currentIndex = currentWallets.findIndex(w => w.id === wallet.id);
    
    if (currentIndex > 0) {
      // Swap with the wallet above
      const temp = currentWallets[currentIndex];
      currentWallets[currentIndex] = currentWallets[currentIndex - 1];
      currentWallets[currentIndex - 1] = temp;
      
      // Update orderPosition values
      this.updateWalletOrderPositions();
      this.walletsSubject.next([...currentWallets]);
    }
  }

  moveWalletDown(wallet: WalletDto): void {
    const currentWallets = this.walletsSubject.value;
    const currentIndex = currentWallets.findIndex(w => w.id === wallet.id);
    
    if (currentIndex < currentWallets.length - 1) {
      // Swap with the wallet below
      const temp = currentWallets[currentIndex];
      currentWallets[currentIndex] = currentWallets[currentIndex + 1];
      currentWallets[currentIndex + 1] = temp;
      
      // Update orderPosition values
      this.updateWalletOrderPositions();
      this.walletsSubject.next([...currentWallets]);
    }
  }

  private getNextOrderPosition(): number {
    const currentWallets = this.walletsSubject.value;
    return currentWallets.length + 1;
  }

  private updateWalletOrderPositions(): void {
    const currentWallets = this.walletsSubject.value;
    currentWallets.forEach((wallet, index) => {
      wallet.orderPosition = index + 1;
    });
  }
}
