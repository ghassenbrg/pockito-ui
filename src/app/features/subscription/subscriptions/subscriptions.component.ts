import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription as SubscriptionModel, SubscriptionFrequency } from '@api/models';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { SubscriptionListComponent } from '@app/components/subscription-list/subscription-list.component';
import { SubscriptionFormDialogComponent } from '@app/components/subscription-form-dialog/subscription-form-dialog.component';
import { PaySubscriptionDialogComponent } from '@app/components/pay-subscription-dialog/pay-subscription-dialog.component';
import { PockitoButtonComponent, PockitoButtonType } from '@shared/components/pockito-button/pockito-button.component';
import { PockitoCurrencyPipe } from '@shared/pipes/pockito-currency.pipe';
import { LoadingService, ToastService } from '@shared/services';
import { SubscriptionStateService } from '../../../state/subscription/subscription-state.service';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    PageHeaderComponent,
    SubscriptionListComponent,
    SubscriptionFormDialogComponent,
    PaySubscriptionDialogComponent,
    PockitoButtonComponent,
    PockitoCurrencyPipe
  ],
  templateUrl: './subscriptions.component.html',
  styleUrl: './subscriptions.component.scss'
})
export class SubscriptionsComponent implements OnInit, OnDestroy {
  subscriptions$!: Observable<SubscriptionModel[] | null>;
  totalMonthlyAmounts$!: Observable<Array<{ total: number; currency: string; subscriptions: SubscriptionModel[] }>>;
  totalMonthlyCount$!: Observable<number>;
  PockitoButtonType = PockitoButtonType;
  displaySubscriptionDialog = false;
  selectedSubscriptionId?: string;
  isPayMode = false;
  isTotalsExpanded = false;
  displayPayDialog = false;
  selectedSubscriptionForPayment?: SubscriptionModel;
  
  private destroy$ = new Subject<void>();

  constructor(
    private subscriptionState: SubscriptionStateService,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.bindLoading();
    this.subscriptions$ = this.subscriptionState.subscriptions$;
    this.calculateTotalMonthlyAmount();
    this.loadSubscriptions();
  }

  toggleTotalsExpanded(): void {
    this.isTotalsExpanded = !this.isTotalsExpanded;
  }

  private calculateTotalMonthlyAmount(): void {
    this.totalMonthlyAmounts$ = this.subscriptions$.pipe(
      map((subscriptions) => {
        if (!subscriptions || subscriptions.length === 0) {
          return [];
        }

        // Filter active subscriptions that have a nextDueDate (need to be paid)
        const activeSubscriptions = subscriptions.filter(
          (sub) => sub.isActive && sub.nextDueDate && sub.monthlyEquivalentAmount !== undefined
        );

        if (activeSubscriptions.length === 0) {
          return [];
        }

        // Group by currency and sum monthly amounts
        const totalsByCurrency = new Map<string, number>();

        activeSubscriptions.forEach((sub) => {
          if (sub.monthlyEquivalentAmount !== undefined) {
            const current = totalsByCurrency.get(sub.currency) || 0;
            totalsByCurrency.set(sub.currency, current + sub.monthlyEquivalentAmount);
          }
        });

        // Group subscriptions by currency for details
        const subscriptionsByCurrency = new Map<string, SubscriptionModel[]>();
        activeSubscriptions.forEach((sub) => {
          if (sub.monthlyEquivalentAmount !== undefined) {
            const subs = subscriptionsByCurrency.get(sub.currency) || [];
            subs.push(sub);
            subscriptionsByCurrency.set(sub.currency, subs);
          }
        });

        // Convert to array of { currency, total, subscriptions } objects and sort by currency
        return Array.from(totalsByCurrency.entries())
          .map(([currency, total]) => ({ 
            currency, 
            total,
            subscriptions: subscriptionsByCurrency.get(currency) || []
          }))
          .sort((a, b) => a.currency.localeCompare(b.currency));
      })
    );

    // Calculate count for conditional display
    this.totalMonthlyCount$ = this.totalMonthlyAmounts$.pipe(
      map((totals) => totals.length)
    );
  }

  private loadSubscriptions(): void {
    this.subscriptionState.loadSubscriptions();
  }

  showCreateSubscriptionDialog(): void {
    this.selectedSubscriptionId = undefined;
    this.isPayMode = false;
    this.displaySubscriptionDialog = true;
  }

  onSubscriptionClick(subscription: SubscriptionModel): void {
    // Open subscription form dialog in edit mode
    this.selectedSubscriptionId = subscription.id;
    this.isPayMode = false;
    this.displaySubscriptionDialog = true;
  }

  onPayClick(subscription: SubscriptionModel): void {
    this.selectedSubscriptionForPayment = subscription;
    this.displayPayDialog = true;
  }

  onSubscriptionSaved(_subscription: SubscriptionModel): void {
    this.displaySubscriptionDialog = false;
    this.selectedSubscriptionId = undefined;
  }

  onFormCancelled(): void {
    this.displaySubscriptionDialog = false;
    this.selectedSubscriptionId = undefined;
  }

  onSubscriptionDeleted(_subscriptionId: string): void {
    this.displaySubscriptionDialog = false;
    this.selectedSubscriptionId = undefined;
  }

  onPaymentCompleted(): void {
    this.displayPayDialog = false;
    this.selectedSubscriptionForPayment = undefined;
    // Reload subscriptions to refresh nextDueDate
    this.loadSubscriptions();
  }

  onPayDialogCancelled(): void {
    this.displayPayDialog = false;
    this.selectedSubscriptionForPayment = undefined;
  }

  onPayDialogVisibleChange(visible: boolean): void {
    this.displayPayDialog = visible;
    if (!visible) {
      this.selectedSubscriptionForPayment = undefined;
    }
  }

  private bindLoading() {
    const SUBSCRIPTION_LOADING_ID = 'subscriptions-page';
    
    this.subscriptionState.isLoading$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isLoading) => {
        if (isLoading) {
          this.loadingService.showWithId(SUBSCRIPTION_LOADING_ID, this.translateService.instant('subscriptions.loading'));
        } else {
          this.loadingService.hide(SUBSCRIPTION_LOADING_ID);
        }
      });
  }

  getFrequencyDisplay(subscription: SubscriptionModel): string {
    if (subscription.interval === 1) {
      const frequencyKey = `enums.subscriptionFrequency.${subscription.frequency}`;
      return this.translateService.instant(frequencyKey);
    }
    
    // For interval > 1, use "Every X Days/Weeks/Months/Years"
    const frequencyPluralMap: Record<SubscriptionFrequency, string> = {
      [SubscriptionFrequency.DAILY]: 'subscriptions.days',
      [SubscriptionFrequency.WEEKLY]: 'subscriptions.weeks',
      [SubscriptionFrequency.MONTHLY]: 'subscriptions.months',
      [SubscriptionFrequency.YEARLY]: 'subscriptions.years'
    };
    
    const pluralKey = frequencyPluralMap[subscription.frequency];
    const plural = this.translateService.instant(pluralKey);
    const every = this.translateService.instant('subscriptions.every');
    
    return `${every} ${subscription.interval} ${plural}`;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.loadingService.hideAll();
  }
}
