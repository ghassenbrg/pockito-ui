import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Subscription, SubscriptionFrequency } from '@api/models';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TooltipModule } from 'primeng/tooltip';
import { PockitoCurrencyPipe } from '../../pipes/pockito-currency.pipe';
import { EmptyStateComponent } from '../empty-state/empty-state.component';

@Component({
  selector: 'app-subscription-list',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    PockitoCurrencyPipe,
    TooltipModule,
    EmptyStateComponent
  ],
  templateUrl: './subscription-list.component.html',
  styleUrl: './subscription-list.component.scss'
})
export class SubscriptionListComponent implements OnInit, OnChanges {
  @Input() subscriptions?: Subscription[] | null;
  @Output() subscriptionClick = new EventEmitter<Subscription>();
  @Output() payClick = new EventEmitter<Subscription>();

  sortedSubscriptions: Subscription[] = [];
  SubscriptionFrequency = SubscriptionFrequency;

  constructor(private translateService: TranslateService) {}

  ngOnInit(): void {
    this.processSubscriptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['subscriptions']) {
      this.processSubscriptions();
    }
  }

  private processSubscriptions(): void {
    // Sort subscriptions by nextDueDate (most urgent first), then by name
    if (!this.subscriptions) {
      this.sortedSubscriptions = [];
      return;
    }

    this.sortedSubscriptions = [...this.subscriptions].sort((a, b) => {
      // Active subscriptions first
      if (a.isActive !== b.isActive) {
        return a.isActive ? -1 : 1;
      }

      // Then by next due date (upcoming first, null last)
      if (a.nextDueDate && b.nextDueDate) {
        const dateA = new Date(a.nextDueDate).getTime();
        const dateB = new Date(b.nextDueDate).getTime();
        return dateA - dateB;
      }
      if (a.nextDueDate && !b.nextDueDate) return -1;
      if (!a.nextDueDate && b.nextDueDate) return 1;

      // Finally by name
      return a.name.localeCompare(b.name);
    });
  }

  onSubscriptionClick(subscription: Subscription): void {
    this.subscriptionClick.emit(subscription);
  }

  onPayClick(subscription: Subscription, event: Event): void {
    event.stopPropagation();
    // Emit pay event - parent will open edit dialog with pay action
    this.payClick.emit(subscription);
    this.subscriptionClick.emit(subscription);
  }


  getFrequencyDisplay(subscription: Subscription): string {
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

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    const dateObj = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if it's today
    if (this.isSameDay(dateObj, today)) {
      return this.translateService.instant('common.today');
    }
    
    // Check if it's tomorrow
    if (this.isSameDay(dateObj, tomorrow)) {
      return this.translateService.instant('common.tomorrow');
    }

    // Check if it's this year
    if (dateObj.getFullYear() === today.getFullYear()) {
      return dateObj.toLocaleDateString(this.translateService.getCurrentLang() || 'en', {
        month: 'long',
        day: 'numeric'
      });
    }

    // Default format with year
    return dateObj.toLocaleDateString(this.translateService.getCurrentLang() || 'en', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  isOverdue(subscription: Subscription): boolean {
    if (!subscription.nextDueDate || !subscription.isActive) {
      return false;
    }
    const dueDate = new Date(subscription.nextDueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  }

  isDueSoon(subscription: Subscription): boolean {
    if (!subscription.nextDueDate || !subscription.isActive || this.isOverdue(subscription)) {
      return false;
    }
    const dueDate = new Date(subscription.nextDueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    // Calculate difference in days
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Due soon if within 3 days (including today = 0, tomorrow = 1, day after = 2, day after that = 3)
    return diffDays >= 0 && diffDays <= 3;
  }

  isDueToday(subscription: Subscription): boolean {
    if (!subscription.nextDueDate || !subscription.isActive) {
      return false;
    }
    const dueDate = new Date(subscription.nextDueDate);
    const today = new Date();
    return this.isSameDay(dueDate, today);
  }
}
