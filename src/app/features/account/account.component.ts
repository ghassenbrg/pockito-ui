import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="account-container">
      <h1>Account</h1>
      <p>Manage your account settings and profile information.</p>
    </div>
  `,
  styles: [`
    .account-container {
      padding: 20px;
    }
  `]
})
export class AccountComponent {}
