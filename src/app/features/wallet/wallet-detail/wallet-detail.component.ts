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
import { DialogModule } from 'primeng/dialog';
import { MenuModule } from 'primeng/menu';
import { WalletFormComponent } from '../wallet-form/wallet-form.component';

@Component({
  selector: 'app-wallet-detail',
  standalone: true,
  imports: [
    CommonModule,
    MenuModule,
    WalletFormComponent,
    TranslatePipe,
    PockitoCurrencyPipe,
    DialogModule,
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
    this.loadingService.show(this.translateService.instant('common.loading'));
    this.transactionService
      .getTransactionsByWallet(this.walletId, { page, size })
      .subscribe({
        next: (transactions: PageTransactionDto) => {
          this.pageableTransactions = transactions;
          this.loadingService.hide(); 
        },
        error: () => {
          this.toastService.showError(
            'common.loadingError',
            'common.loadingErrorMessage'
          );
          this.loadingService.hide();
        }
      });
  }

  onPageChange(event: any) {
    const currentPage = Math.floor(event.first / event.rows);
    const pageSize = event.rows;
    this.getTransactions(currentPage, pageSize);
  }

  onPageSizeChange(newPageSize: number) {
    this.getTransactions(0, newPageSize);
  }

  getWallet() {
    this.loadingService.show(this.translateService.instant('common.loading'));
    this.walletService.getWallet(this.walletId).subscribe({
      next: (wallet: WalletDto) => {
        this.wallet = wallet;
        this.loadingService.hide();
      },
      error: () => {
        this.toastService.showError(
          'common.loadingError',
          'common.loadingErrorMessage'
        );
        this.loadingService.hide();
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

  deleteWallet() {
    this.loadingService.show(this.translateService.instant('common.loading'));
    this.walletService.deleteWallet(this.walletId).subscribe({
      next: () => {
        this.toastService.showSuccess(
          'common.deleteSuccess',
          'common.deleteSuccessMessage'
        );
        this.loadingService.hide();
        this.router.navigate(['../'], { relativeTo: this.route });
      },
      error: () => {
        this.toastService.showError(
          'common.deleteError',
          'common.deleteErrorMessage'
        );
        this.loadingService.hide();
      }
    });
  }

}
