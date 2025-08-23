# Wallet Service

The `WalletService` provides a complete interface for managing wallets in the Pockito application, implementing all endpoints defined in the OpenAPI specification.

## Features

- **CRUD Operations**: Create, read, update, and delete wallets
- **Soft Delete Support**: Archive and activate wallets
- **Default Wallet Management**: Set and manage the user's default wallet
- **Type Safety**: Full TypeScript support with strongly-typed interfaces
- **HTTP Integration**: Built on Angular's HttpClient with proper error handling

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/wallets` | Get all wallets for the current user |
| `GET` | `/api/wallets/{id}` | Get a specific wallet by ID |
| `POST` | `/api/wallets` | Create a new wallet |
| `PUT` | `/api/wallets/{id}` | Update an existing wallet |
| `POST` | `/api/wallets/{id}/default` | Set a wallet as default |
| `POST` | `/api/wallets/{id}/archive` | Archive a wallet (soft delete) |
| `POST` | `/api/wallets/{id}/activate` | Activate a previously archived wallet |

## Usage

### Basic Setup

```typescript
import { WalletService } from '@shared/services/wallet.service';
import { Wallet, CreateWalletRequest } from '@shared/models';

@Component({...})
export class WalletComponent {
  constructor(private walletService: WalletService) {}
}
```

### Get All Wallets

```typescript
this.walletService.getWallets().subscribe({
  next: (wallets: Wallet[]) => {
    console.log('Wallets:', wallets);
  },
  error: (error) => {
    console.error('Error fetching wallets:', error);
  }
});
```

### Create a New Wallet

```typescript
const newWallet: CreateWalletRequest = {
  name: 'My Savings',
  iconType: 'EMOJI',
  iconValue: '💰',
  currencyCode: 'USD',
  color: '#3B82F6',
  type: 'SAVINGS',
  initialBalance: 1000.00,
  goalAmount: 10000.00,
  setDefault: false
};

this.walletService.createWallet(newWallet).subscribe({
  next: (wallet: Wallet) => {
    console.log('Wallet created:', wallet);
  },
  error: (error) => {
    console.error('Error creating wallet:', error);
  }
});
```

### Update a Wallet

```typescript
const updateData: UpdateWalletRequest = {
  name: 'Updated Wallet Name',
  iconType: 'URL',
  iconValue: 'https://example.com/icon.png',
  currencyCode: 'EUR',
  color: '#10B981',
  type: 'BANK_ACCOUNT',
  goalAmount: 5000.00
};

this.walletService.updateWallet(walletId, updateData).subscribe({
  next: (wallet: Wallet) => {
    console.log('Wallet updated:', wallet);
  },
  error: (error) => {
    console.error('Error updating wallet:', error);
  }
});
```

### Set Default Wallet

```typescript
this.walletService.setDefaultWallet(walletId).subscribe({
  next: () => {
    console.log('Default wallet set successfully');
  },
  error: (error) => {
    console.error('Error setting default wallet:', error);
  }
});
```

### Archive/Activate Wallet

```typescript
// Archive a wallet
this.walletService.archiveWallet(walletId).subscribe({
  next: () => {
    console.log('Wallet archived successfully');
  },
  error: (error) => {
    console.error('Error archiving wallet:', error);
  }
});

// Activate a previously archived wallet
this.walletService.activateWallet(walletId).subscribe({
  next: () => {
    console.log('Wallet activated successfully');
  },
  error: (error) => {
    console.error('Error activating wallet:', error);
  }
});
```

## Data Models

### Wallet Interface

```typescript
interface Wallet {
  id: string;                    // UUID
  name: string;                  // Wallet name
  iconType: 'EMOJI' | 'URL';    // Icon type
  iconValue: string;             // Icon value (emoji or URL)
  currencyCode: string;          // 3-letter currency code
  color?: string;                // Hex color code
  type: WalletType;              // Wallet type
  initialBalance: number;        // Initial balance
  isDefault: boolean;            // Is default wallet
  goalAmount?: number;           // Goal amount (for savings)
  userId: string;                // Owner user ID
  createdAt: string;             // Creation timestamp
  updatedAt: string;             // Last update timestamp
}
```

### Create Wallet Request

```typescript
interface CreateWalletRequest {
  name: string;                  // Required: Wallet name
  iconType: 'EMOJI' | 'URL';    // Required: Icon type
  iconValue: string;             // Required: Icon value
  currencyCode: string;          // Required: 3-letter currency code
  color?: string;                // Optional: Hex color code
  type: WalletType;              // Required: Wallet type
  initialBalance?: number;       // Optional: Initial balance
  goalAmount?: number;           // Optional: Goal amount
  setDefault?: boolean;          // Optional: Set as default
}
```

### Update Wallet Request

```typescript
interface UpdateWalletRequest {
  name: string;                  // Required: Wallet name
  iconType: 'EMOJI' | 'URL';    // Required: Icon type
  iconValue: string;             // Required: Icon value
  currencyCode: string;          // Required: 3-letter currency code
  color?: string;                // Optional: Hex color code
  type: WalletType;              // Required: Wallet type
  goalAmount?: number;           // Optional: Goal amount
}
```

## Wallet Types

The service supports the following wallet types:

- **SAVINGS**: Savings account with optional goal amount
- **BANK_ACCOUNT**: Traditional bank account
- **CASH**: Physical cash holdings
- **CREDIT_CARD**: Credit card account
- **CUSTOM**: Custom wallet type

## Error Handling

The service uses Angular's HttpClient, which provides built-in error handling. Always subscribe with error callbacks:

```typescript
this.walletService.getWallets().subscribe({
  next: (wallets) => {
    // Handle success
  },
  error: (error) => {
    // Handle error
    if (error.status === 401) {
      // Unauthorized - redirect to login
    } else if (error.status === 404) {
      // Wallet not found
    } else {
      // Other errors
    }
  }
});
```

## Testing

The service includes comprehensive unit tests using Angular's TestBed and HttpTestingController. Run tests with:

```bash
npm test -- --include="**/wallet.service.spec.ts"
```

## Dependencies

- `@angular/core`: Injectable decorator and core Angular functionality
- `@angular/common/http`: HttpClient for HTTP requests
- `rxjs`: Observable support
- Environment configuration for API URL management
