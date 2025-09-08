import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';
import { TransactionFilters, TransactionFormData } from '../../models/transaction.types';
import { WalletDto } from '@api/model/wallet.model';
import { Category } from '@api/model/category.model';
import { TransactionFacade } from '../../services/transaction.facade';

@Component({
  selector: 'app-transaction-filters',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    DropdownModule, 
    CalendarModule, 
    ButtonModule, 
    TranslateModule
  ],
  templateUrl: './transaction-filters.component.html',
  styleUrl: './transaction-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionFiltersComponent implements OnInit, OnChanges {
  @Input() wallets: WalletDto[] = [];
  @Input() categories: Category[] = [];
  @Input() currentFilters: TransactionFilters = {};
  @Output() filtersChange = new EventEmitter<TransactionFilters>();
  @Output() clearFilters = new EventEmitter<void>();

  transactionTypes = [
    { label: 'All Types', value: null },
    { label: 'Expense', value: 'EXPENSE' },
    { label: 'Income', value: 'INCOME' },
    { label: 'Transfer', value: 'TRANSFER' }
  ];

  dateRange: Date[] = [];
  selectedWallet: WalletDto | null = null;
  selectedType: string | null = null;

  constructor(private transactionFacade: TransactionFacade) {}

  ngOnInit(): void {
    // Ensure data is loaded when filters component initializes
    this.transactionFacade.ensureDataLoaded();
    this.initializeFilters();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentFilters'] || changes['wallets']) {
      this.initializeFilters();
    }
  }

  private initializeFilters(): void {
    // Initialize filters from currentFilters input
    if (this.currentFilters.startDate && this.currentFilters.endDate) {
      this.dateRange = [
        new Date(this.currentFilters.startDate),
        new Date(this.currentFilters.endDate)
      ];
    }

    if (this.currentFilters.walletId) {
      this.selectedWallet = this.wallets.find(w => w.id === this.currentFilters.walletId) || null;
    }

    if (this.currentFilters.transactionType) {
      this.selectedType = this.currentFilters.transactionType;
    }
  }

  onWalletChange(wallet: WalletDto | null): void {
    this.selectedWallet = wallet;
    this.emitFilters();
  }

  onTypeChange(type: string | null): void {
    this.selectedType = type;
    this.emitFilters();
  }

  onDateRangeChange(dates: Date | Date[]): void {
    if (Array.isArray(dates)) {
      this.dateRange = dates;
    } else {
      this.dateRange = [dates];
    }
    this.emitFilters();
  }

  onClearFilters(): void {
    this.selectedWallet = null;
    this.selectedType = null;
    this.dateRange = [];
    this.clearFilters.emit();
  }

  private emitFilters(): void {
    const filters: TransactionFilters = {};

    if (this.selectedWallet?.id) {
      filters.walletId = this.selectedWallet.id;
    }

    if (this.selectedType) {
      filters.transactionType = this.selectedType as any;
    }

    if (this.dateRange && this.dateRange.length === 2) {
      filters.startDate = this.dateRange[0].toISOString().split('T')[0];
      filters.endDate = this.dateRange[1].toISOString().split('T')[0];
    }

    this.filtersChange.emit(filters);
  }
}
