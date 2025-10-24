import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { PockitoCurrencyPipe } from '@shared/pipes/pockito-currency.pipe';

export interface DialogOption {
  id: string | null;
  name: string;
  iconUrl?: string;
  fallbackIcon?: string;
  type?: string;
  typeLabel?: string;
  currency?: string;
  balance?: number;
}

@Component({
  selector: 'app-dialog-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    PockitoCurrencyPipe,
  ],
  templateUrl: './dialog-selector.component.html',
  styleUrl: './dialog-selector.component.scss'
})
export class DialogSelectorComponent implements OnInit, OnDestroy, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Input() options: DialogOption[] = [];
  @Input() selectedOptionId?: string;
  @Input() maxWidth: string = '600px';
  @Input() maxHeight: string = '90vh';
  @Input() searchPlaceholder: string = 'common.search';
  @Input() showSearch: boolean = true;

  @Output() optionSelected = new EventEmitter<string | null>();
  @Output() dialogClosed = new EventEmitter<void>();

  searchTerm: string = '';
  filteredOptions: DialogOption[] = [];
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  selectOption(optionId: string | null): void {
    this.optionSelected.emit(optionId ?? null);
    this.closeDialog();
  }

  closeDialog(): void {
    this.dialogClosed.emit();
  }

  getSelectedOption(): DialogOption | undefined {
    return this.options.find(option => option.id === this.selectedOptionId);
  }

  getOptionIcon(option: DialogOption): string {
    if (option.iconUrl) {
      return option.iconUrl;
    }
    return option.fallbackIcon || 'pi pi-circle';
  }

  ngOnInit(): void {
    this.initializeFilteredOptions();
    
    // Setup search debouncing
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        this.filterOptions(searchTerm);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options'] && this.options) {
      this.initializeFilteredOptions();
    }
  }

  onSearchChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.searchSubject.next(searchTerm);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredOptions = [...this.options];
  }

  private filterOptions(searchTerm: string): void {
    if (!searchTerm.trim()) {
      this.filteredOptions = [...this.options];
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    this.filteredOptions = this.options.filter(option => 
      option.name.toLowerCase().includes(term) ||
      (option.typeLabel && option.typeLabel.toLowerCase().includes(term))
    );
  }

  getDisplayOptions(): DialogOption[] {
    return this.filteredOptions;
  }


  private initializeFilteredOptions(): void {
    this.filteredOptions = [...this.options];
    this.searchTerm = '';
  }
}
