import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageTransactionDto, TransactionType, Wallet } from '@api/models';
import { TransactionService } from '@api/services';
import { WalletStateService } from '../../../state/wallet/wallet-state.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { PockitoButtonType } from '@shared/components/pockito-button/pockito-button.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { TransactionListComponent } from '@shared/components/transaction-list/transaction-list.component';
import { LoadingService, ToastService } from '@shared/services';
import { PockitoCurrencyPipe } from '@shared/pipes/pockito-currency.pipe';
import { ButtonModule } from 'primeng/button';
import { WalletFormDialogComponent } from '@shared/components/wallet-form-dialog/wallet-form-dialog.component';

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
export class WalletDetailComponent implements OnInit {
  wallet: Wallet | null = null;
  walletId: string = '';
  PockitoButtonType = PockitoButtonType;
  TransactionType = TransactionType;
  displayEditWalletDialog = false;
  Math = Math;
  pageableTransactions?: PageTransactionDto;
  allTransactions: any[] = [];

  constructor(
    private walletState: WalletStateService,
    private transactionService: TransactionService,
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
    this.getTransactions(0, 10);
  }

  getTransactions(page: number = 0, size: number = 10) {
    const loadingId = this.loadingService.show(this.translateService.instant('common.loading'));
    
    this.transactionService
      .getTransactionsByWallet(this.walletId, { page, size })
      .subscribe({
        next: (transactions: PageTransactionDto) => {
          if (page === 0) {
            // First load - replace all transactions
            this.allTransactions = transactions.content || [];
          } else {
            // Load more - append to existing transactions
            this.allTransactions = [...this.allTransactions, ...(transactions.content || [])];
          }
          
          // Update pageableTransactions with combined data
          this.pageableTransactions = {
            ...transactions,
            content: this.allTransactions
          };
          
          this.loadingService.hide(loadingId); 
        },
        error: () => {
          this.toastService.showError(
            'common.loadingError',
            'common.loadingErrorMessage'
          );
          this.loadingService.hide(loadingId);
        }
      });
  }

  onLoadMore() {
    // Get current page from backend response and load next page
    const currentPage = this.pageableTransactions?.number || 0;
    const nextPage = currentPage + 1;
    this.getTransactions(nextPage, 10);
  }

  private bindWallet() {
    this.walletState.currentWallet$.subscribe({
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
    let loadingId: string | null = null;
    this.walletState.isLoading$.subscribe((isLoading) => {
      if (isLoading && !loadingId) {
        loadingId = this.loadingService.show(this.translateService.instant('common.loading'));
      } else if (!isLoading && loadingId) {
        this.loadingService.hide(loadingId);
        loadingId = null;
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


}
