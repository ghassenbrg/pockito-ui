import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WalletListComponent } from './wallet-list/wallet-list.component';

@Component({
  selector: 'app-wallets',
  standalone: true,
  imports: [CommonModule, WalletListComponent],
  template: `
    <app-wallet-list></app-wallet-list>
  `,
  styles: []
})
export class WalletsComponent {}
