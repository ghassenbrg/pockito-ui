import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { WalletDto } from '@api/models';
import { WalletService } from '@api/services';
import { LoadingService, ToastService } from '@shared/services';
import {
  PockitoButtonComponent,
  PockitoButtonType,
} from '@shared/components/pockito-button/pockito-button.component';
import { PockitoCurrencyPipe } from '../../../shared/pipes/pockito-currency.pipe';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogModule } from "primeng/dialog";
import { WalletFormComponent } from '../wallet-form/wallet-form.component';

@Component({
  selector: 'app-wallets',
  standalone: true,
  imports: [
    CommonModule,
    PockitoButtonComponent,
    WalletFormComponent,
    TranslatePipe,
    PockitoCurrencyPipe,
    DialogModule
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
    this.loadingService.show(this.translateService.instant('wallets.loading'));
    this.walletService.getUserWallets().subscribe({
      next: (wallets) => {
        this.wallets = wallets.slice().sort((a, b) => {
          // If either orderPosition is undefined, sort it after those with defined positions
          if (a.orderPosition == null && b.orderPosition == null) return 0;
          if (a.orderPosition == null) return 1;
          if (b.orderPosition == null) return -1;
          return a.orderPosition - b.orderPosition;
        });
        this.loadingService.hide();
      },
      error: () => {
        this.toastService.showError('loadingError');
        this.loadingService.hide();
      },
      complete: () => {
        this.loadingService.hide();
      },
    });
  }

  showCreateWalletDialog() {
    this.displayCreateWalletDialog = true;
  }

  addWallet() {
    // TODO: Implement add wallet functionality
    this.toastService.showSuccess('wallets.addWallet');
  }

  viewWallet(wallet: WalletDto) {
    this.router.navigate([wallet.id], { relativeTo: this.route });
  }
}
