import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="subscriptions-container">
      <h1>Subscriptions</h1>
      <p>Manage your recurring subscriptions and services.</p>
    </div>
  `,
  styles: [`
    .subscriptions-container {
      padding: 20px;
    }
  `]
})
export class SubscriptionsComponent {}
