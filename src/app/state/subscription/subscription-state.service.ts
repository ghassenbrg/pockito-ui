import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { SubscriptionService } from '../../api/services/subscription.service';
import { Subscription, SubscriptionRequest, PaySubscriptionRequest, Transaction } from '../../api/models';
import { WalletStateService } from '../wallet/wallet-state.service';
import { TransactionsStateService } from '../transaction/transactions-state.service';

@Injectable({ providedIn: 'root' })
export class SubscriptionStateService {
  private readonly subscriptionsSubject = new BehaviorSubject<Subscription[] | null>(null);
  private readonly currentSubscriptionSubject = new BehaviorSubject<Subscription | null>(null);
  private readonly isLoadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);

  readonly subscriptions$: Observable<Subscription[] | null> = this.subscriptionsSubject.asObservable();
  readonly currentSubscription$: Observable<Subscription | null> = this.currentSubscriptionSubject.asObservable();
  readonly isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();
  readonly error$: Observable<string | null> = this.errorSubject.asObservable();

  constructor(
    private readonly subscriptionApi: SubscriptionService,
    private readonly walletState: WalletStateService,
    private readonly transactionsState: TransactionsStateService
  ) {}

  /** Load all subscriptions for the current user. Idempotent. */
  loadSubscriptions(): void {
    this.beginLoading();
    this.subscriptionApi
      .listSubscriptions()
      .pipe(
        tap((subscriptions) => {
          this.subscriptionsSubject.next([...subscriptions]);
          // Keep currentSubscription in sync if it exists in the list
          const current = this.currentSubscriptionSubject.value;
          if (current) {
            const updated = subscriptions.find((s) => s.id === current.id) ?? null;
            this.currentSubscriptionSubject.next(updated);
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

  /** Load a single subscription and set it as current. */
  loadSubscription(subscriptionId: string): void {
    this.beginLoading();
    this.subscriptionApi
      .getSubscription(subscriptionId)
      .pipe(
        tap((subscription) => {
          this.currentSubscriptionSubject.next(subscription);
          const subscriptions = this.subscriptionsSubject.value ?? [];
          const idx = subscriptions.findIndex((s) => s.id === subscription.id);
          const next = idx >= 0
            ? [...subscriptions.slice(0, idx), subscription, ...subscriptions.slice(idx + 1)]
            : [subscription, ...subscriptions];
          this.subscriptionsSubject.next(next);
        }),
        catchError((err) => {
          this.setError(this.humanizeError(err));
          return [] as unknown as Observable<never>;
        }),
        finalize(() => this.endLoading())
      )
      .subscribe();
  }

  /** Create a new subscription and merge into local state. */
  createSubscription(request: SubscriptionRequest): Observable<Subscription> {
    this.beginLoading();
    return this.subscriptionApi
      .createSubscription(request)
      .pipe(
        tap((created) => {
          const subscriptions = this.subscriptionsSubject.value ?? [];
          this.subscriptionsSubject.next([created, ...subscriptions]);
        }),
        catchError((err) => {
          this.setError(this.humanizeError(err));
          throw err;
        }),
        finalize(() => this.endLoading())
      );
  }

  /** Update an existing subscription and update local state. */
  updateSubscription(subscriptionId: string, request: SubscriptionRequest): Observable<Subscription> {
    this.beginLoading();
    return this.subscriptionApi
      .updateSubscription(subscriptionId, request)
      .pipe(
        tap((updated) => {
          const subscriptions = this.subscriptionsSubject.value ?? [];
          const idx = subscriptions.findIndex((s) => s.id === updated.id);
          if (idx >= 0) {
            const next = [...subscriptions];
            next[idx] = updated;
            this.subscriptionsSubject.next(next);
          }
          if (this.currentSubscriptionSubject.value?.id === updated.id) {
            this.currentSubscriptionSubject.next(updated);
          }
        }),
        catchError((err) => {
          this.setError(this.humanizeError(err));
          throw err;
        }),
        finalize(() => this.endLoading())
      );
  }

  /** Delete a subscription and remove it from local state. */
  deleteSubscription(subscriptionId: string): Observable<void> {
    this.beginLoading();
    return this.subscriptionApi
      .deleteSubscription(subscriptionId)
      .pipe(
        tap(() => {
          const subscriptions = this.subscriptionsSubject.value ?? [];
          const next = subscriptions.filter((s) => s.id !== subscriptionId);
          this.subscriptionsSubject.next(next);
          if (this.currentSubscriptionSubject.value?.id === subscriptionId) {
            this.currentSubscriptionSubject.next(null);
          }
        }),
        catchError((err) => {
          this.setError(this.humanizeError(err));
          throw err;
        }),
        finalize(() => this.endLoading()),
        map(() => void 0)
      );
  }

  /** Pay a subscription and refresh affected wallet balances. */
  paySubscription(subscriptionId: string, request: PaySubscriptionRequest): Observable<Transaction> {
    this.beginLoading();
    return this.subscriptionApi
      .paySubscription(subscriptionId, request)
      .pipe(
        tap((transaction) => {
          // Refresh the subscription to get updated nextDueDate
          this.refreshSubscriptionSilently(subscriptionId);
          // Refresh affected wallet balance if provided
          if (transaction && transaction.walletFromId) {
            this.walletState.refreshWalletSilently(transaction.walletFromId);
          }
        }),
        catchError((err) => {
          this.setError(this.humanizeError(err));
          throw err;
        }),
        finalize(() => this.endLoading())
      );
  }

  /** Set the current subscription explicitly (local only). */
  setCurrentSubscription(subscription: Subscription | null): void {
    this.currentSubscriptionSubject.next(subscription);
  }

  /** Refresh a subscription from server and update local state. */
  refreshSubscription(subscriptionId: string): void {
    this.beginLoading();
    this.subscriptionApi
      .getSubscription(subscriptionId)
      .pipe(
        tap((subscription) => {
          const subscriptions = this.subscriptionsSubject.value ?? [];
          const idx = subscriptions.findIndex((s) => s.id === subscription.id);
          const next = idx >= 0
            ? [...subscriptions.slice(0, idx), subscription, ...subscriptions.slice(idx + 1)]
            : [subscription, ...subscriptions];
          this.subscriptionsSubject.next(next);
          if (this.currentSubscriptionSubject.value?.id === subscription.id) {
            this.currentSubscriptionSubject.next(subscription);
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

  /** Refresh a subscription silently without affecting loading state. */
  refreshSubscriptionSilently(subscriptionId: string): void {
    this.subscriptionApi
      .getSubscription(subscriptionId)
      .pipe(
        tap((subscription) => {
          const subscriptions = this.subscriptionsSubject.value ?? [];
          const idx = subscriptions.findIndex((s) => s.id === subscription.id);
          const next = idx >= 0
            ? [...subscriptions.slice(0, idx), subscription, ...subscriptions.slice(idx + 1)]
            : [subscription, ...subscriptions];
          this.subscriptionsSubject.next(next);
          if (this.currentSubscriptionSubject.value?.id === subscription.id) {
            this.currentSubscriptionSubject.next(subscription);
          }
        }),
        catchError(() => {
          // Silently fail - subscription refresh shouldn't break payment flows
          return [];
        })
      )
      .subscribe();
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

