import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-wallets',
  standalone: true,
  imports: [],
  templateUrl: './wallets.component.html',
  styleUrl: './wallets.component.scss',
})
export class WalletsComponent implements OnInit {
  wallets: any[] = [];

  constructor() {}

  ngOnInit(): void {
    this.wallets = [
      {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        name: 'Personal Savings',
        initialBalance: 1000,
        balance: 1200,
        currency: 'USD',
        iconUrl: 'https://example.com/icons/savings.png',
        goalAmount: 5000,
        type: 'SAVINGS',
        isDefault: true,
        active: true,
      },
      {
        id: 'b2c3d4e5-f678-9012-abcd-ef2345678901',
        name: 'Checking Account',
        initialBalance: 500,
        balance: 350,
        currency: 'USD',
        iconUrl: 'https://example.com/icons/bank.png',
        goalAmount: 0,
        type: 'BANK_ACCOUNT',
        isDefault: false,
        active: true,
      },
      {
        id: 'c3d4e5f6-7890-1234-abcd-ef3456789012',
        name: 'Cash Wallet',
        initialBalance: 200,
        balance: 50,
        currency: 'USD',
        iconUrl: 'https://example.com/icons/cash.png',
        goalAmount: 0,
        type: 'CASH',
        isDefault: false,
        active: true,
      },
      {
        id: 'd4e5f678-9012-3456-abcd-ef4567890123',
        name: 'Credit Card',
        initialBalance: 0,
        balance: -300,
        currency: 'USD',
        iconUrl: 'https://example.com/icons/creditcard.png',
        goalAmount: 0,
        type: 'CREDIT_CARD',
        isDefault: false,
        active: true,
      },
      {
        id: 'e5f67890-1234-5678-abcd-ef5678901234',
        name: 'Vacation Fund',
        initialBalance: 0,
        balance: 800,
        currency: 'USD',
        iconUrl: 'https://example.com/icons/custom.png',
        goalAmount: 2000,
        type: 'CUSTOM',
        isDefault: false,
        active: false,
      },
    ];
  }
}
