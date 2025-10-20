import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageTransactionDto, TransactionType, WalletDto } from '@api/models';
import { TransactionService, WalletService } from '@api/services';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { PockitoButtonType } from '@shared/components/pockito-button/pockito-button.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { LoadingService, ToastService } from '@shared/services';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MenuModule } from 'primeng/menu';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { PockitoCurrencyPipe } from '../../../shared/pipes/pockito-currency.pipe';
import { WalletFormComponent } from '../wallet-form/wallet-form.component';

@Component({
  selector: 'app-wallet-detail',
  standalone: true,
  imports: [
    CommonModule,
    MenuModule,
    PaginatorModule,
    TableModule,
    WalletFormComponent,
    TranslatePipe,
    PockitoCurrencyPipe,
    DialogModule,
    ButtonModule,
    PageHeaderComponent,
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
  groupedTransactions: { [date: string]: any[] } = {};
  
  // Pagination properties
  currentPage: number = 0;
  pageSize: number = 10;
  totalRecords: number = 0;

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
          this.totalRecords = transactions.totalElements;
          this.currentPage = transactions.number || 0;
          this.pageSize = transactions.size || 10;
          this.pageableTransactions = transactions;
          this.groupTransactionsByDate(transactions.content || []);
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
    this.currentPage = Math.floor(event.first / event.rows);
    this.pageSize = event.rows;
    this.getTransactions(this.currentPage, event.rows);
  }

  onPageSizeChange(event: any) {
    const newPageSize = parseInt(event.target.value);
    this.pageSize = newPageSize;
    this.currentPage = 0; // Reset to first page when changing page size
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

  getPaginatorTemplate() {
    return this.translateService.instant('common.paginatorTemplate', {
      first: this.currentPage * this.pageSize + 1,
      last: Math.min((this.currentPage + 1) * this.pageSize, this.totalRecords),
      totalRecords: this.totalRecords,
    });
  }

  groupTransactionsByDate(transactions: any[]) {
    // Clear previous grouping
    this.groupedTransactions = {};

    // Sort transactions by update date (most recent first)
    const sortedTransactions = transactions.sort((a, b) => {
      const dateA = new Date(a.updateDate || a.effectiveDate);
      const dateB = new Date(b.updateDate || b.effectiveDate);
      return dateB.getTime() - dateA.getTime();
    });

    // Group by effective date
    sortedTransactions.forEach(transaction => {
      const effectiveDate = transaction.effectiveDate;
      const dateKey = this.formatDateKey(effectiveDate);
      
      if (!this.groupedTransactions[dateKey]) {
        this.groupedTransactions[dateKey] = [];
      }
      this.groupedTransactions[dateKey].push(transaction);
    });
  }

  formatDateKey(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  formatDisplayDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if it's today
    if (this.isSameDay(date, today)) {
      return this.translateService.instant('common.today');
    }
    
    // Check if it's yesterday
    if (this.isSameDay(date, yesterday)) {
      return this.translateService.instant('common.yesterday');
    }

    // Check if it's this year
    if (date.getFullYear() === today.getFullYear()) {
      return date.toLocaleDateString(this.translateService.currentLang || 'en', {
        month: 'long',
        day: 'numeric'
      });
    }

    // Default format with year
    return date.toLocaleDateString(this.translateService.currentLang || 'en', {
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

  getSortedDateKeys(): string[] {
    return Object.keys(this.groupedTransactions).sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime(); // Most recent first
    });
  }

  getTransactionDisplayName(transaction: any): string {
    if (transaction.transactionType === TransactionType.TRANSFER) {
      return 'Transfer';
    }
    
    // For income and expense, show the category name
    return transaction.categoryName || 'Unknown Category';
  }
}
