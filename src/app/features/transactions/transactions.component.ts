import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="transactions-container">
      <h1>Transactions</h1>
      <p>View and manage your financial transactions.</p>
    </div>
  `,
  styles: [`
    .transactions-container {
      padding: 20px;
    }
  `]
})
export class TransactionsComponent {}
