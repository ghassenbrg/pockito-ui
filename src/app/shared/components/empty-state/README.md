# Empty State Component

A reusable empty state component that displays a centered icon, title, and message when there's no data to show.

## Usage

```html
<app-empty-state
  icon="fa-solid fa-receipt"
  title="transactions.noTransactions"
  message="transactions.noTransactionsMessage"
></app-empty-state>
```

## Input Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `icon` | string | `'fa-solid fa-inbox'` | FontAwesome icon class to display |
| `title` | string | `''` | Translation key for the title text |
| `message` | string | `''` | Translation key for the message text |
| `show` | boolean | `true` | Whether to show the empty state |

## Examples

### Transactions Empty State
```html
<app-empty-state
  icon="fa-solid fa-receipt"
  title="transactions.noTransactions"
  message="transactions.noTransactionsMessage"
></app-empty-state>
```

### Wallets Empty State
```html
<app-empty-state
  icon="fa-solid fa-wallet"
  title="wallets.noWallets"
  message="wallets.noWalletsMessage"
></app-empty-state>
```

### Custom Empty State
```html
<app-empty-state
  icon="fa-solid fa-search"
  title="search.noResults"
  message="search.noResultsMessage"
  [show]="searchResults.length === 0"
></app-empty-state>
```

## Features

- Responsive design with mobile optimizations
- Smooth animations and hover effects
- Configurable icon, title, and message
- Supports internationalization with translation keys
- Accessibility-friendly with proper ARIA attributes
- Consistent styling with the design system
