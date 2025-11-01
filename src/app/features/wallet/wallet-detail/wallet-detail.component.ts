import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageTransactionDto, Pageable, TransactionDto, TransactionType, Wallet } from '@api/models';
import { WalletStateService } from '../../../state/wallet/wallet-state.service';
import { TransactionsStateService } from '../../../state/transaction/transactions-state.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { PockitoButtonType } from '@shared/components/pockito-button/pockito-button.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { TransactionListComponent } from '@app/components/transaction-list/transaction-list.component';
import { LoadingService, ToastService } from '@shared/services';
import { PockitoCurrencyPipe } from '@shared/pipes/pockito-currency.pipe';
import { ButtonModule } from 'primeng/button';
import { WalletFormDialogComponent } from '@app/components/wallet-form-dialog/wallet-form-dialog.component';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-wallet-detail',
  standalone: true,
  imports: [
    CommonModule,
    WalletFormDialogComponent,
    TranslatePipe,
    PockitoCurrencyPipe,
    ButtonModule,
    PageHeaderComponent,
    TransactionListComponent,
  ],
  templateUrl: './wallet-detail.component.html',
  styleUrl: './wallet-detail.component.scss',
})
export class WalletDetailComponent implements OnInit, OnDestroy {
  wallet: Wallet | null = null;
  walletId: string = '';
  PockitoButtonType = PockitoButtonType;
  TransactionType = TransactionType;
  displayEditWalletDialog = false;
  Math = Math;
  pageableTransactions$!: Observable<PageTransactionDto | null>;
  
  private destroy$ = new Subject<void>();

  constructor(
    private walletState: WalletStateService,
    private transactionsState: TransactionsStateService,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private translateService: TranslateService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.walletId = this.route.snapshot.params['id'];
    this.bindLoading();
    this.bindWallet();
    this.walletState.loadWallet(this.walletId);
    this.pageableTransactions$ = this.transactionsState.pageable$;
    this.loadFirstPage();
  }

  private loadFirstPage(): void {
    const pageable: Pageable = { page: 0, size: 10, sort: ['effectiveDate,desc'] };
    this.transactionsState.loadFirstPage(pageable, { walletId: this.walletId });
  }

  onLoadMore(): void {
    this.transactionsState.loadNextPage();
  }

  onTransactionSaved(_transaction: TransactionDto): void {
    // The state will merge the updated transaction when it matches current filters
  }

  private bindWallet() {
    this.walletState.currentWallet$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (wallet) => {
          this.wallet = wallet ?? null;
        },
        error: () => {
          this.toastService.showError(
            'common.loadingError',
            'common.loadingErrorMessage'
          );
        }
      });
  }

  private bindLoading() {
    // Use fixed IDs for wallet and transactions loading states
    const WALLET_LOADING_ID = 'wallet-detail-wallet';
    const TRANSACTION_LOADING_ID = 'wallet-detail-transactions';
    
    // Subscribe to wallet loading state
    this.walletState.isLoading$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isLoading) => {
        if (isLoading) {
          this.loadingService.showWithId(WALLET_LOADING_ID, this.translateService.instant('common.loading'));
        } else {
          this.loadingService.hide(WALLET_LOADING_ID);
        }
      });
    
    // Subscribe to transactions loading state
    this.transactionsState.isLoading$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isLoading) => {
        if (isLoading) {
          this.loadingService.showWithId(TRANSACTION_LOADING_ID, this.translateService.instant('common.loading'));
        } else {
          this.loadingService.hide(TRANSACTION_LOADING_ID);
        }
      });
  }

  showEditWalletDialog() {
    this.displayEditWalletDialog = true;
  }

  onWalletSaved(wallet: Wallet) {
    this.wallet = wallet;
    this.displayEditWalletDialog = false;
  }

  onFormCancelled() {
    this.displayEditWalletDialog = false;
  }

  onWalletDeleted() {
    this.displayEditWalletDialog = false;
    // Navigate back to wallets list since the wallet was deleted
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  ngOnDestroy(): void {
    // Clean up all subscriptions to prevent memory leaks
    this.destroy$.next();
    this.destroy$.complete();
    
    // Clean up any lingering loading indicators
    this.loadingService.hideAll();
  }

}
