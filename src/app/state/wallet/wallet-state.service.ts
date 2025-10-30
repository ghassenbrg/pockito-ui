import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { WalletService } from '../../api/services/wallet.service';
import { Wallet, WalletList, WalletRequest, WalletType } from '../../api/models';

@Injectable({ providedIn: 'root' })
export class WalletStateService {
  private readonly walletsSubject = new BehaviorSubject<Wallet[] | null>(null);
  private readonly currentWalletSubject = new BehaviorSubject<Wallet | null>(null);
  private readonly isLoadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);

  readonly wallets$: Observable<Wallet[] | null> = this.walletsSubject.asObservable();
  readonly currentWallet$: Observable<Wallet | null> = this.currentWalletSubject.asObservable();
  readonly isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();
  readonly error$: Observable<string | null> = this.errorSubject.asObservable();

  readonly balances$: Observable<Record<string, number>> = this.walletsSubject.pipe(
    map((wallets) => {
      if (!wallets) {
        return {} as Record<string, number>;
      }
      return wallets.reduce((acc, w) => {
        acc[w.id] = w.balance;
        return acc;
      }, {} as Record<string, number>);
    })
  );

  constructor(private readonly walletApi: WalletService) {}

  /** Load all wallets for the current user. Idempotent. */
  loadWallets(): void {
    this.beginLoading();
    this.walletApi
      .getUserWallets()
      .pipe(
        tap((list: WalletList) => {
          this.walletsSubject.next([...list.wallets]);
          // Keep currentWallet in sync if it exists in the list
          const current = this.currentWalletSubject.value;
          if (current) {
            const updated = list.wallets.find((w) => w.id === current.id) ?? null;
            this.currentWalletSubject.next(updated);
          } else {
            // Optionally set default wallet if present
            const defaultWallet = list.wallets.find((w) => w.isDefault) ?? null;
            if (defaultWallet) {
              this.currentWalletSubject.next(defaultWallet);
            }
          }
        }),
        catchError((err) => {
          this.setError(this.humanizeError(err));
          return [] as unknown as Observable<never>;
        }),
        finalize(() => this.endLoading())
      )
      .subscribe();
  }

  /** Load a single wallet and set it as current. */
  loadWallet(walletId: string): void {
    this.beginLoading();
    this.walletApi
      .getWallet(walletId)
      .pipe(
        tap((wallet) => {
          this.currentWalletSubject.next(wallet);
          const wallets = this.walletsSubject.value ?? [];
          const idx = wallets.findIndex((w) => w.id === wallet.id);
          const next = idx >= 0
            ? [...wallets.slice(0, idx), wallet, ...wallets.slice(idx + 1)]
            : [wallet, ...wallets];
          this.walletsSubject.next(next);
        }),
        catchError((err) => {
          this.setError(this.humanizeError(err));
          return [] as unknown as Observable<never>;
        }),
        finalize(() => this.endLoading())
      )
      .subscribe();
  }

  /** Create a new wallet and merge into local state. */
  createWallet(request: WalletRequest): void {
    this.beginLoading();
    this.walletApi
      .createWallet(request)
      .pipe(
        tap((created) => {
          const wallets = this.walletsSubject.value ?? [];
          this.walletsSubject.next([created, ...wallets]);
          if (created.isDefault) {
            this.currentWalletSubject.next(created);
          }
          // TODO: After transaction creation affects wallet balances, we should refresh balances here if needed.
        }),
        catchError((err) => {
          this.setError(this.humanizeError(err));
          return [] as unknown as Observable<never>;
        }),
        finalize(() => this.endLoading())
      )
      .subscribe();
  }

  /** Update an existing wallet and update local state. */
  updateWallet(walletId: string, request: WalletRequest): void {
    this.beginLoading();
    this.walletApi
      .updateWallet(walletId, request)
      .pipe(
        tap((updated) => {
          const wallets = this.walletsSubject.value ?? [];
          const idx = wallets.findIndex((w) => w.id === updated.id);
          if (idx >= 0) {
            const next = [...wallets];
            next[idx] = updated;
            this.walletsSubject.next(next);
          }
          if (this.currentWalletSubject.value?.id === updated.id) {
            this.currentWalletSubject.next(updated);
          }
        }),
        catchError((err) => {
          this.setError(this.humanizeError(err));
          return [] as unknown as Observable<never>;
        }),
        finalize(() => this.endLoading())
      )
      .subscribe();
  }

  /** Delete a wallet and remove it from local state. */
  deleteWallet(walletId: string): void {
    this.beginLoading();
    this.walletApi
      .deleteWallet(walletId)
      .pipe(
        tap(() => {
          const wallets = this.walletsSubject.value ?? [];
          const next = wallets.filter((w) => w.id !== walletId);
          this.walletsSubject.next(next);
          if (this.currentWalletSubject.value?.id === walletId) {
            this.currentWalletSubject.next(null);
          }
        }),
        catchError((err) => {
          this.setError(this.humanizeError(err));
          return [] as unknown as Observable<never>;
        }),
        finalize(() => this.endLoading())
      )
      .subscribe();
  }

  /** Set the current wallet explicitly (local only). */
  setCurrentWallet(wallet: Wallet | null): void {
    this.currentWalletSubject.next(wallet);
  }

  /** Set default wallet server-side and sync locally. */
  setDefaultWallet(walletId: string): void {
    this.beginLoading();
    this.walletApi
      .setDefaultWallet(walletId)
      .pipe(
        tap((updatedDefault) => {
          const wallets = this.walletsSubject.value ?? [];
          const next = wallets.map((w) => ({ ...w, isDefault: w.id === updatedDefault.id }));
          this.walletsSubject.next(next);
          this.currentWalletSubject.next(updatedDefault);
        }),
        catchError((err) => {
          this.setError(this.humanizeError(err));
          return [] as unknown as Observable<never>;
        }),
        finalize(() => this.endLoading())
      )
      .subscribe();
  }

  /** Filter wallets by type on server and replace local cache. */
  loadWalletsByType(type: WalletType): void {
    this.beginLoading();
    this.walletApi
      .getWalletsByType(type)
      .pipe(
        tap((list) => this.walletsSubject.next([...(list.wallets ?? [])])),
        catchError((err) => {
          this.setError(this.humanizeError(err));
          return [] as unknown as Observable<never>;
        }),
        finalize(() => this.endLoading())
      )
      .subscribe();
  }

  /** Reorder wallets server-side and reflect the new order locally if provided. */
  reorderWallets(request: { walletIdsOrdered: string[] }): void {
    // Wrap the specific request type if needed later; for now keep it simple
    this.beginLoading();
    // Using any to avoid tight coupling if generated type differs; adjust if needed
    this.walletApi
      .reorderWallets(request as any)
      .pipe(
        tap(() => {
          const wallets = this.walletsSubject.value ?? [];
          const order = request.walletIdsOrdered;
          const mapById = new Map(wallets.map((w) => [w.id, w] as const));
          const next: Wallet[] = [];
          order.forEach((id) => {
            const w = mapById.get(id);
            if (w) {
              next.push(w);
            }
          });
          // Append any missing ones (defensive)
          wallets.forEach((w) => {
            if (!mapById.has(w.id) || !next.find((x) => x.id === w.id)) {
              next.push(w);
            }
          });
          this.walletsSubject.next(next);
        }),
        catchError((err) => {
          this.setError(this.humanizeError(err));
          return [] as unknown as Observable<never>;
        }),
        finalize(() => this.endLoading())
      )
      .subscribe();
  }

  /** Refresh a wallet from server and update local balance and fields. */
  refreshWallet(walletId: string): void {
    this.beginLoading();
    this.walletApi
      .getWallet(walletId)
      .pipe(
        tap((wallet) => {
          const wallets = this.walletsSubject.value ?? [];
          const idx = wallets.findIndex((w) => w.id === wallet.id);
          const next = idx >= 0
            ? [...wallets.slice(0, idx), wallet, ...wallets.slice(idx + 1)]
            : [wallet, ...wallets];
          this.walletsSubject.next(next);
          if (this.currentWalletSubject.value?.id === wallet.id) {
            this.currentWalletSubject.next(wallet);
          }
        }),
        catchError((err) => {
          this.setError(this.humanizeError(err));
          return [] as unknown as Observable<never>;
        }),
        finalize(() => this.endLoading())
      )
      .subscribe();
  }

  /** Refresh all wallets (balances) by reloading list. */
  refreshAllBalances(): void {
    this.loadWallets();
  }

  private beginLoading(): void {
    this.isLoadingSubject.next(true);
    this.errorSubject.next(null);
  }

  private endLoading(): void {
    this.isLoadingSubject.next(false);
  }

  private setError(message: string): void {
    this.errorSubject.next(message);
  }

  private humanizeError(err: unknown): string {
    if (!err) return 'Unknown error';
    const anyErr = err as any;
    return (
      anyErr?.error?.message || anyErr?.message || 'Something went wrong. Please try again.'
    );
  }
}


