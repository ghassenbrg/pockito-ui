# Pockito API Services and Models

This directory contains the generated TypeScript services and models based on the OpenAPI specification for the Pockito backend API.

## Structure

```
src/app/api/
├── models/           # TypeScript interfaces and types
│   ├── wallet.model.ts
│   ├── transaction.model.ts
│   ├── category.model.ts
│   ├── user.model.ts
│   └── index.ts
├── services/         # Angular services for API calls
│   ├── wallet.service.ts
│   ├── transaction.service.ts
│   ├── category.service.ts
│   ├── user.service.ts
│   └── index.ts
├── index.ts          # Main export file
└── README.md         # This documentation
```

## Models

### Wallet Model (`wallet.model.ts`)
- `WalletDto`: Main wallet interface
- `Currency`: Supported currency types (USD, EUR, GBP, etc.)
- `WalletType`: Wallet types (BANK_ACCOUNT, CASH, CREDIT_CARD, SAVINGS, CUSTOM)
- `ReorderWalletsRequest`: Request interface for reordering wallets

### Transaction Model (`transaction.model.ts`)
- `TransactionDto`: Main transaction interface
- `TransactionType`: Transaction types (TRANSFER, EXPENSE, INCOME)
- `Pageable`: Pagination parameters
- `PageTransactionDto`: Paginated transaction response
- `Sort`: Sorting parameters

### Category Model (`category.model.ts`)
- `CategoryDto`: Main category interface
- `CategoryType`: Category types (EXPENSE, INCOME)

### User Model (`user.model.ts`)
- `UserDto`: Main user interface
- `Country`: Supported country codes
- `Currency`: Re-exported from wallet model

## Services

### Wallet Service (`wallet.service.ts`)
Provides methods for wallet management:
- `getUserWallets()`: Get all wallets for current user
- `createWallet(wallet)`: Create a new wallet
- `getWallet(walletId)`: Get specific wallet by ID
- `updateWallet(walletId, wallet)`: Update a wallet
- `deleteWallet(walletId)`: Delete a wallet
- `setDefaultWallet(walletId)`: Set wallet as default
- `getDefaultWallet()`: Get the default wallet
- `getWalletsByType(type)`: Get wallets by type
- `reorderWallets(request)`: Reorder wallets

### Transaction Service (`transaction.service.ts`)
Provides methods for transaction management:
- `listTransactions(pageable, filters)`: List transactions with pagination and filters
- `createTransaction(transaction)`: Create a new transaction
- `getTransaction(transactionId)`: Get specific transaction by ID
- `updateTransaction(transactionId, transaction)`: Update a transaction
- `deleteTransaction(transactionId)`: Delete a transaction
- `getTransactionsByWallet(walletId, pageable)`: Get transactions by wallet
- `getTransactionsByType(type, pageable)`: Get transactions by type
- `getTransactionsByDateRange(startDate, endDate, pageable)`: Get transactions by date range
- `getAllTransactions()`: Get all transactions (use with caution)

### Category Service (`category.service.ts`)
Provides methods for category management:
- `getUserCategories()`: Get all categories for authenticated user
- `createCategory(category)`: Create a new category
- `getCategory(categoryId)`: Get specific category by ID
- `updateCategory(categoryId, category)`: Update a category
- `deleteCategory(categoryId)`: Delete a category
- `getChildCategories(parentCategoryId)`: Get child categories
- `getCategoriesByType(type)`: Get categories by type
- `getRootCategories()`: Get root categories
- `getHierarchicalCategories()`: Get categories in hierarchical order
- `getHierarchicalCategoriesByType(type)`: Get hierarchical categories by type
- `getCategoriesByColor(color)`: Get categories by color

### User Service (`user.service.ts`)
Provides methods for user management:
- `getOrCreateCurrentUser()`: Get or create current user
- `getUserByUsername(username)`: Get user by username
- `checkUserExists(username)`: Check if user exists
- `updateUserCurrency(username, currencyCode)`: Update user currency
- `updateUserCountry(username, countryCode)`: Update user country

## Usage

### Import Services
```typescript
import { WalletService, TransactionService, CategoryService, UserService } from './api';
```

### Import Models
```typescript
import { WalletDto, TransactionDto, CategoryDto, UserDto } from './api';
```

### Example Usage
```typescript
constructor(
  private walletService: WalletService,
  private transactionService: TransactionService
) {}

// Get all wallets
this.walletService.getUserWallets().subscribe(wallets => {
  console.log('Wallets:', wallets);
});

// Create a new wallet
const newWallet: WalletDto = {
  name: 'My Wallet',
  type: 'BANK_ACCOUNT',
  currency: 'USD',
  initialBalance: 1000,
  isDefault: false
};

this.walletService.createWallet(newWallet).subscribe(wallet => {
  console.log('Created wallet:', wallet);
});

// Get transactions with pagination
const pageable = { page: 0, size: 10, sort: ['effectiveDate,desc'] };
this.transactionService.listTransactions(pageable).subscribe(page => {
  console.log('Transactions:', page.content);
});
```

## API Base URL

All services use relative URLs starting with `/api/`. Make sure your Angular application is configured to proxy API requests to your backend server.

## Error Handling

All service methods return Observables. Make sure to handle errors appropriately:

```typescript
this.walletService.getUserWallets().subscribe({
  next: (wallets) => console.log('Success:', wallets),
  error: (error) => console.error('Error:', error)
});
```

## Pagination

For paginated endpoints, use the `Pageable` interface:

```typescript
const pageable: Pageable = {
  page: 0,        // Page number (0-based)
  size: 20,        // Page size
  sort: ['name,asc', 'createdAt,desc']  // Sort criteria
};
```

## Filtering

Transaction service supports various filters:
- `walletId`: Filter by wallet
- `startDate`/`endDate`: Date range filtering (yyyy-MM-dd format)
- `transactionType`: Filter by transaction type

Example:
```typescript
this.transactionService.listTransactions(
  pageable,
  'wallet-uuid',
  '2024-01-01',
  '2024-12-31',
  'EXPENSE'
).subscribe(page => {
  console.log('Filtered transactions:', page.content);
});
```
