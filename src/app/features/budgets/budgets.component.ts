import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="budgets-container">
      <h1>Budgets</h1>
      <p>Create and manage your financial budgets.</p>
    </div>
  `,
  styles: [`
    .budgets-container {
      padding: 20px;
    }
  `]
})
export class BudgetsComponent {}
