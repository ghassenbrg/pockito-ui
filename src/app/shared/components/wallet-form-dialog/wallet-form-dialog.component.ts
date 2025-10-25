import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WalletDto } from '@api/models';
import { TranslatePipe } from '@ngx-translate/core';
import { PockitoDialogComponent } from '@shared/components/pockito-dialog/pockito-dialog.component';
import { WalletFormComponent } from '@features/wallet/wallet-form/wallet-form.component';

@Component({
  selector: 'app-wallet-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    PockitoDialogComponent,
    WalletFormComponent,
  ],
  templateUrl: './wallet-form-dialog.component.html',
  styleUrls: ['./wallet-form-dialog.component.scss']
})
export class WalletFormDialogComponent {
  @Input() visible: boolean = false;
  @Input() walletId?: string;
  
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() walletSaved = new EventEmitter<WalletDto>();
  @Output() formCancelled = new EventEmitter<void>();

  onWalletSaved(wallet: WalletDto): void {
    this.walletSaved.emit(wallet);
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
}
