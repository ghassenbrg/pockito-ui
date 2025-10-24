import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DialogSelectorComponent, DialogOption } from '../dialog-selector/dialog-selector.component';
import { PockitoCurrencyPipe } from '@shared/pipes/pockito-currency.pipe';

@Component({
  selector: 'app-pockito-selector',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    DialogSelectorComponent,
    PockitoCurrencyPipe,
  ],
  templateUrl: './pockito-selector.component.html',
  styleUrl: './pockito-selector.component.scss'
})
export class PockitoSelectorComponent {
  // Generic inputs
  @Input() selectedId?: string;
  @Input() isInvalid: boolean = false;
  @Input() placeholder: string = '';
  @Input() title: string = '';
  @Input() searchPlaceholder: string = '';
  @Input() options: DialogOption[] = [];
  @Input() selectedItem?: any; // The actual selected item object
  @Input() showBalance: boolean = false;
  @Input() balance?: number;
  @Input() currency?: string;

  // Outputs
  @Output() itemSelected = new EventEmitter<string | null>();
  @Output() itemCleared = new EventEmitter<void>();
  @Output() itemTouched = new EventEmitter<void>();

  showDialog: boolean = false;

  openDialog(): void {
    this.showDialog = true;
  }

  closeDialog(): void {
    this.showDialog = false;
  }

  selectItem(itemId: string | null): void {
    this.itemSelected.emit(itemId);
  }

  onDialogOptionSelected(optionId: string | null): void {
    this.selectItem(optionId);
  }

  onDialogClosed(): void {
    this.closeDialog();
    this.itemTouched.emit();
  }

  getItemIcon(): string {
    if (!this.selectedItem) return '';
    
    if (this.selectedItem.iconUrl) {
      return this.selectedItem.iconUrl;
    }
    return this.selectedItem.fallbackIcon || 'pi pi-circle';
  }

  getItemName(): string {
    if (!this.selectedItem) return '';
    return this.selectedItem.name || '';
  }
}
