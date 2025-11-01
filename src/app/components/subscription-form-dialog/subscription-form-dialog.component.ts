import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from '@api/models';
import { TranslatePipe } from '@ngx-translate/core';
import { PockitoDialogComponent } from '@shared/components/pockito-dialog/pockito-dialog.component';
import { SubscriptionFormComponent } from '@app/components/subscription-form/subscription-form.component';
import { SubscriptionStateService } from '../../state/subscription/subscription-state.service';
import { ToastService } from '@shared/services/toast.service';
import { TranslateService } from '@ngx-translate/core';
import { LoadingService } from '@shared/services/loading.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-subscription-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    PockitoDialogComponent,
    SubscriptionFormComponent,
  ],
  templateUrl: './subscription-form-dialog.component.html',
  styleUrls: ['./subscription-form-dialog.component.scss']
})
export class SubscriptionFormDialogComponent implements OnDestroy {
  @Input() visible: boolean = false;
  @Input() subscriptionId?: string;
  
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() subscriptionSaved = new EventEmitter<Subscription>();
  @Output() formCancelled = new EventEmitter<void>();
  @Output() subscriptionDeleted = new EventEmitter<string>();

  private destroy$ = new Subject<void>();

  constructor(
    private subscriptionState: SubscriptionStateService,
    private toastService: ToastService,
    private translate: TranslateService,
    private loadingService: LoadingService
  ) {
    this.bindLoading();
  }

  onSubscriptionSaved(subscription: Subscription): void {
    this.subscriptionSaved.emit(subscription);
    this.closeDialog();
  }

  onFormCancelled(): void {
    this.formCancelled.emit();
    this.closeDialog();
  }

  onDialogVisibleChange(visible: boolean): void {
    this.visibleChange.emit(visible);
  }

  private closeDialog(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  // Check if we're in edit mode
  isEditMode(): boolean {
    return !!this.subscriptionId;
  }

  // Get dialog header text
  getDialogHeader(): string {
    return this.subscriptionId ? 'subscriptions.editSubscription' : 'subscriptions.createSubscription';
  }

  // Delete subscription
  deleteSubscription(): void {
    if (!this.subscriptionId) {
      return;
    }

    if (confirm(this.translate.instant('subscriptions.delete.confirm'))) {
      const targetId = this.subscriptionId;
      
      this.subscriptionState.deleteSubscription(targetId).subscribe({
        next: () => {
          this.toastService.showSuccess(
            'subscriptions.delete.success',
            'subscriptions.delete.successMessage'
          );
          this.subscriptionDeleted.emit(targetId);
          this.closeDialog();
        },
        error: () => {
          this.toastService.showError('subscriptions.delete.error', 'subscriptions.delete.errorMessage');
        }
      });
    }
  }

  private bindLoading(): void {
    const LOADING_ID = 'subscription-form-dialog';
    
    this.subscriptionState.isLoading$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isLoading) => {
        if (isLoading) {
          this.loadingService.showWithId(LOADING_ID, this.translate.instant('common.loading'));
        } else {
          this.loadingService.hide(LOADING_ID);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.loadingService.hideAll();
  }
}

