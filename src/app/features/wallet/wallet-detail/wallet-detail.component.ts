import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageTransactionDto, TransactionType, WalletDto } from '@api/models';
import { TransactionService, WalletService } from '@api/services';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { PockitoButtonType } from '@shared/components/pockito-button/pockito-button.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { TransactionListComponent } from '@shared/components/transaction-list/transaction-list.component';
import { LoadingService, ToastService } from '@shared/services';
import { PockitoCurrencyPipe } from '@shared/pipes/pockito-currency.pipe';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { WalletFormDialogComponent } from '@shared/components/wallet-form-dialog/wallet-form-dialog.component';

@Component({
  selector: 'app-wallet-detail',
  standalone: true,
  imports: [
    CommonModule,
    MenuModule,
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
  wallet: WalletDto | null = null;
  walletId: string = '';
  PockitoButtonType = PockitoButtonType;
  TransactionType = TransactionType;
  displayEditWalletDialog = false;
  Math = Math;
  menuItems: MenuItem[] = [];
  pageableTransactions?: PageTransactionDto;
  allTransactions: any[] = [];

  constructor(
    private walletService: WalletService,
    private transactionService: TransactionService,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private translateService: TranslateService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.walletId = this.route.snapshot.params['id'];
    this.menuItems = [
      {
        label: this.translateService.instant('common.edit'),
        icon: 'pi pi-pencil',
        command: () => this.showEditWalletDialog(),
      },
      {
        label: this.translateService.instant('common.delete'),
        icon: 'pi pi-trash',
        command: () => this.deleteWallet(),
      },
    ];
    this.getWallet();
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

  getWallet() {
    const loadingId = this.loadingService.show(this.translateService.instant('common.loading'));
    
    this.walletService.getWallet(this.walletId).subscribe({
      next: (wallet: WalletDto) => {
        this.wallet = wallet;
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

  showEditWalletDialog() {
    this.displayEditWalletDialog = true;
  }

  onWalletSaved(wallet: WalletDto) {
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

  deleteWallet() {
    const loadingId = this.loadingService.show(this.translateService.instant('common.loading'));
    
    this.walletService.deleteWallet(this.walletId).subscribe({
      next: () => {
        this.toastService.showSuccess(
          'common.deleteSuccess',
          'common.deleteSuccessMessage'
        );
        this.loadingService.hide(loadingId);
        this.router.navigate(['../'], { relativeTo: this.route });
      },
      error: () => {
        this.toastService.showError(
          'common.deleteError',
          'common.deleteErrorMessage'
        );
        this.loadingService.hide(loadingId);
      }
    });
  }

}
