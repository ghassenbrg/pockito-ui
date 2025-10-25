import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WalletDto } from '@api/models';
import { WalletService } from '@api/services';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  PockitoButtonComponent,
  PockitoButtonType,
} from '@shared/components/pockito-button/pockito-button.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { LoadingService, ToastService } from '@shared/services';
import { PockitoCurrencyPipe } from '../../../shared/pipes/pockito-currency.pipe';
import { WalletFormDialogComponent } from '@shared/components/wallet-form-dialog/wallet-form-dialog.component';

@Component({
  selector: 'app-wallets',
  standalone: true,
  imports: [
    CommonModule,
    PockitoButtonComponent,
    WalletFormDialogComponent,
    TranslatePipe,
    PockitoCurrencyPipe,
    PageHeaderComponent,
    EmptyStateComponent,
  ],
  templateUrl: './wallets.component.html',
  styleUrl: './wallets.component.scss',
})
export class WalletsComponent implements OnInit {
  wallets: WalletDto[] = [];
  PockitoButtonType = PockitoButtonType;
  displayCreateWalletDialog = false;

  constructor(
    private walletService: WalletService,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private translateService: TranslateService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.getWallets();
  }

  getWallets() {
    const loadingId = this.loadingService.show(this.translateService.instant('wallets.loading'));
    
    this.walletService.getUserWallets().subscribe({
      next: (wallets) => {
        this.wallets = wallets.slice().sort((a, b) => {
          // If either orderPosition is undefined, sort it after those with defined positions
          if (a.orderPosition == null && b.orderPosition == null) return 0;
          if (a.orderPosition == null) return 1;
          if (b.orderPosition == null) return -1;
          return a.orderPosition - b.orderPosition;
        });
        this.loadingService.hide(loadingId);
      },
      error: () => {
        this.toastService.showError(
          'wallets.loadingError',
          'wallets.loadingErrorMessage'
        );
        this.loadingService.hide(loadingId);
      }
    });
  }

  showCreateWalletDialog() {
    this.displayCreateWalletDialog = true;
  }

  onWalletSaved(wallet: WalletDto) {
    this.wallets = this.wallets.filter((w) => w.id !== wallet.id);
    this.wallets.push(wallet);
    this.wallets = this.wallets.sort((a, b) => {
      if (a.orderPosition == null && b.orderPosition == null) return 0;
      if (a.orderPosition == null) return 1;
      if (b.orderPosition == null) return -1;
      return a.orderPosition - b.orderPosition;
    });
    this.displayCreateWalletDialog = false;
  }

  onFormCancelled() {
    this.displayCreateWalletDialog = false;
  }

  viewWallet(wallet: WalletDto) {
    this.router.navigate([wallet.id], { relativeTo: this.route });
  }
}
