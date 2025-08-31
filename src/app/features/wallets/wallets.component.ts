import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-wallets',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="wallets-container">
      <h1>Wallets</h1>
      <p>Manage your digital wallets and accounts.</p>
    </div>
  `,
  styles: [`
    .wallets-container {
      padding: 20px;
    }
  `]
})
export class WalletsComponent {}
