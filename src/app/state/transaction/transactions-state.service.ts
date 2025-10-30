import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { TransactionService } from '../../api/services/transaction.service';
import { PageTransactionDto, Pageable, Transaction, TransactionDto, TransactionRequest, TransactionType } from '../../api/models';
import { WalletStateService } from '../wallet/wallet-state.service';

@Injectable({ providedIn: 'root' })
export class TransactionsStateService {
  private readonly transactionsSubject = new BehaviorSubject<TransactionDto[]>([]);
  private readonly currentTransactionSubject = new BehaviorSubject<TransactionDto | null>(null);
  private readonly pageableSubject = new BehaviorSubject<PageTransactionDto | null>(null);
  private readonly isLoadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);

  readonly transactions$: Observable<TransactionDto[]> = this.transactionsSubject.asObservable();
  readonly pageable$: Observable<PageTransactionDto | null> = this.pageableSubject.asObservable();
  readonly currentTransaction$: Observable<TransactionDto | null> = this.currentTransactionSubject.asObservable();
  readonly isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();
  readonly error$: Observable<string | null> = this.errorSubject.asObservable();

  // Current filters
  private currentWalletId: string | undefined;
  private currentType: TransactionType | undefined;
  private currentStartDate: string | undefined;
  private currentEndDate: string | undefined;

  constructor(
    private readonly txApi: TransactionService,
    private readonly walletState: WalletStateService
  ) {}

  /** Reset state and load first page with optional filters. */
  loadFirstPage(pageable: Pageable, options?: {
    walletId?: string;
    startDate?: string;
    endDate?: string;
    transactionType?: TransactionType;
  }): void {
    this.currentWalletId = options?.walletId;
    this.currentType = options?.transactionType;
    this.currentStartDate = options?.startDate;
    this.currentEndDate = options?.endDate;

    this.beginLoading();
    this.txApi
      .listTransactions(pageable, this.currentWalletId, this.currentStartDate, this.currentEndDate, this.currentType)
      .pipe(
        tap((page: PageTransactionDto) => {
          this.transactionsSubject.next([...(page.content || [])]);
          this.pageableSubject.next(page);
        }),
        catchError((err) => {
          this.setError(this.humanizeError(err));
          return [] as unknown as Observable<never>;
        }),
        finalize(() => this.endLoading())
      )
      .subscribe();
  }

  /** Load next page using current filters and append to list. */
  loadNextPage(): void {
    const lastPage = this.pageableSubject.value;
    const nextPageNumber = (lastPage?.number || 0) + 1;
    const pageable: Pageable = {
      page: nextPageNumber,
      size: lastPage?.size || 10,
      // Keep a stable sort definition suitable for Pageable
      sort: ['effectiveDate,desc']
    };

    this.beginLoading();
    this.txApi
      .listTransactions(pageable, this.currentWalletId, this.currentStartDate, this.currentEndDate, this.currentType)
      .pipe(
        tap((page: PageTransactionDto) => {
          const combined: TransactionDto[] = [...this.transactionsSubject.value, ...(page.content || [])];
          this.transactionsSubject.next(combined);
          this.pageableSubject.next({ ...page, content: combined });
        }),
        catchError((err) => {
          this.setError(this.humanizeError(err));
          return [] as unknown as Observable<never>;
        }),
        finalize(() => this.endLoading())
      )
      .subscribe();
  }

  /** Create transaction then prepend to current list if it matches filters. */
  createTransaction(request: TransactionRequest): Observable<Transaction> {
    this.beginLoading();
    return this.txApi
      .createTransaction(request)
      .pipe(
        tap((created: Transaction) => {
          const createdWalletIds = [created.walletFromId, created.walletToId].filter(Boolean) as string[];
          const matchesWallet = !this.currentWalletId || createdWalletIds.includes(this.currentWalletId);
          const matchesType = !this.currentType || created.transactionType === this.currentType;
          // Optional date range checks could be added if needed
          if (matchesWallet && matchesType) {
            const next: TransactionDto[] = [created as unknown as TransactionDto, ...this.transactionsSubject.value];
            this.transactionsSubject.next(next);
            const page = this.pageableSubject.value;
            if (page) {
              this.pageableSubject.next({ ...page, content: next });
            }
          }
          // Refresh affected wallet balances silently (don't show loading)
          createdWalletIds.forEach(walletId => {
            this.walletState.refreshWalletSilently(walletId);
          });
        }),
        catchError((err) => {
          this.setError(this.humanizeError(err));
          throw err;
        }),
        finalize(() => this.endLoading())
      );
  }

  /** Fetch a transaction by id and expose on currentTransaction$. */
  loadTransactionById(transactionId: string): void {
    this.beginLoading();
    this.txApi
      .getTransaction(transactionId)
      .pipe(
        tap((tx) => {
          this.currentTransactionSubject.next(tx as unknown as TransactionDto);
          // Also upsert into the list cache
          const list = this.transactionsSubject.value;
          const idx = list.findIndex((t) => t.id === tx.id);
          const next = idx >= 0 ? [...list.slice(0, idx), tx as unknown as TransactionDto, ...list.slice(idx + 1)] : [tx as unknown as TransactionDto, ...list];
          this.transactionsSubject.next(next);
        }),
        catchError((err) => {
          this.setError(this.humanizeError(err));
          return [] as unknown as Observable<never>;
        }),
        finalize(() => this.endLoading())
      )
      .subscribe();
  }

  /** Update an existing transaction and merge into caches. */
  updateTransaction(transactionId: string, request: TransactionRequest): Observable<Transaction> {
    this.beginLoading();
    return this.txApi
      .updateTransaction(transactionId, request)
      .pipe(
        tap((updated) => {
          const list = this.transactionsSubject.value;
          const idx = list.findIndex((t) => t.id === updated.id);
          const next = idx >= 0 ? [...list.slice(0, idx), updated as unknown as TransactionDto, ...list.slice(idx + 1)] : [updated as unknown as TransactionDto, ...list];
          this.transactionsSubject.next(next);
          const page = this.pageableSubject.value;
          if (page) {
            this.pageableSubject.next({ ...page, content: next });
          }
          if (this.currentTransactionSubject.value?.id === updated.id) {
            this.currentTransactionSubject.next(updated as unknown as TransactionDto);
          }
          // Refresh affected wallet balances silently
          const affectedWalletIds = [updated.walletFromId, updated.walletToId].filter(Boolean) as string[];
          affectedWalletIds.forEach(walletId => {
            this.walletState.refreshWalletSilently(walletId);
          });
        }),
        catchError((err) => {
          this.setError(this.humanizeError(err));
          throw err;
        }),
        finalize(() => this.endLoading())
      );
  }
  /** Delete transaction and remove from local list. */
  deleteTransaction(transactionId: string): Observable<void> {
    // Get affected wallets before deletion
    const existingTx = this.transactionsSubject.value.find((t) => t.id === transactionId);
    const affectedWalletIds = existingTx 
      ? [existingTx.walletFromId, existingTx.walletToId].filter(Boolean) as string[]
      : [];
    
    this.beginLoading();
    return this.txApi
      .deleteTransaction(transactionId)
      .pipe(
        tap(() => {
          const next = this.transactionsSubject.value.filter((t) => t.id !== transactionId);
          this.transactionsSubject.next(next);
          const page = this.pageableSubject.value;
          if (page) {
            this.pageableSubject.next({ ...page, content: next });
          }
          // Refresh affected wallet balances silently
          affectedWalletIds.forEach(walletId => {
            this.walletState.refreshWalletSilently(walletId);
          });
        }),
        catchError((err) => {
          this.setError(this.humanizeError(err));
          throw err;
        }),
        finalize(() => this.endLoading()),
        map(() => void 0)
      );
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
    return anyErr?.error?.message || anyErr?.message || 'Something went wrong. Please try again.';
  }
}


