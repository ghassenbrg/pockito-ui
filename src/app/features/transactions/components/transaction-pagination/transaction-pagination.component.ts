import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-transaction-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, DropdownModule, TooltipModule, TranslateModule],
  templateUrl: './transaction-pagination.component.html',
  styleUrl: './transaction-pagination.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionPaginationComponent {
  @Input() paginationInfo: any = {
    currentPage: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
    startIndex: 0,
    endIndex: 0
  };
  @Input() loading = false;
  
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  pageSizeOptions = [
    { label: '10', value: 10 },
    { label: '25', value: 25 },
    { label: '50', value: 50 },
    { label: '100', value: 100 }
  ];

  get currentPage(): number {
    return this.paginationInfo?.currentPage || 0;
  }

  get pageSize(): number {
    return this.paginationInfo?.pageSize || 10;
  }

  get totalElements(): number {
    return this.paginationInfo?.totalElements || 0;
  }

  get totalPages(): number {
    return this.paginationInfo?.totalPages || 0;
  }

  get startIndex(): number {
    return this.paginationInfo?.startIndex || 0;
  }

  get endIndex(): number {
    return this.paginationInfo?.endIndex || 0;
  }

  get hasNextPage(): boolean {
    return this.paginationInfo?.hasNextPage || false;
  }

  get hasPreviousPage(): boolean {
    return this.paginationInfo?.hasPreviousPage || false;
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const totalPages = this.totalPages;
    const currentPage = this.currentPage;
    
    // Show up to 5 page numbers
    let startPage = Math.max(0, currentPage - 2);
    let endPage = Math.min(totalPages - 1, startPage + 4);
    
    // Adjust start page if we're near the end
    if (endPage - startPage < 4) {
      startPage = Math.max(0, endPage - 4);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  onPageChange(page: number): void {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  onPageSizeChange(size: number): void {
    this.pageSizeChange.emit(size);
  }

  onFirstPage(): void {
    this.onPageChange(0);
  }

  onLastPage(): void {
    this.onPageChange(this.totalPages - 1);
  }

  onNextPage(): void {
    if (this.hasNextPage) {
      this.onPageChange(this.currentPage + 1);
    }
  }

  onPreviousPage(): void {
    if (this.hasPreviousPage) {
      this.onPageChange(this.currentPage - 1);
    }
  }
}
