import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { Wallet } from '@api/models';
import { WalletStateService } from '../../../state/wallet/wallet-state.service';
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
  walletsSorted$!: Observable<Wallet[]>;
  PockitoButtonType = PockitoButtonType;
  displayCreateWalletDialog = false;

  constructor(
    private walletState: WalletStateService,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private translateService: TranslateService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.bindLoading();
    this.walletsSorted$ = this.walletState.wallets$.pipe(
      map((wallets) => {
        const list = wallets ?? [];
        return list.slice().sort((a, b) => {
          if (a.orderPosition == null && b.orderPosition == null) return 0;
          if (a.orderPosition == null) return 1;
          if (b.orderPosition == null) return -1;
          return a.orderPosition - b.orderPosition;
        });
      })
    );
    this.walletState.loadWallets();
  }

  // Data is now bound via async pipe; errors are surfaced via toasts on load failure at state layer

  private bindLoading() {
    let loadingId: string | null = null;
    this.walletState.isLoading$.subscribe((isLoading) => {
      if (isLoading && !loadingId) {
        loadingId = this.loadingService.show(this.translateService.instant('wallets.loading'));
      } else if (!isLoading && loadingId) {
        this.loadingService.hide(loadingId);
        loadingId = null;
      }
    });
  }

  showCreateWalletDialog() {
    this.displayCreateWalletDialog = true;
  }

  onWalletSaved(_wallet: Wallet) {
    this.displayCreateWalletDialog = false;
  }

  onFormCancelled() {
    this.displayCreateWalletDialog = false;
  }

  onWalletDeleted(_walletId: string) {
    this.displayCreateWalletDialog = false;
  }

  viewWallet(wallet: Wallet) {
    this.router.navigate([wallet.id], { relativeTo: this.route });
  }
}
