# Path Aliases Configuration

This document describes the path aliases configured in the Pockito UI application to make imports cleaner and more maintainable.

## Available Path Aliases

The following path aliases are configured in `tsconfig.json`:

| Alias | Path | Description |
|-------|------|-------------|
| `@app/*` | `src/app/*` | Root app directory |
| `@core/*` | `src/app/core/*` | Core functionality (guards, interceptors, services) |
| `@features/*` | `src/app/features/*` | Feature modules (wallets, transactions, etc.) |
| `@shared/*` | `src/app/shared/*` | Shared components, services, and utilities |
| `@state/*` | `src/app/state/*` | State management (NgRx stores, etc.) |
| `@api/*` | `src/app/api/*` | API services and models |
| `@assets/*` | `src/assets/*` | Static assets (images, icons, etc.) |
| `@environments/*` | `src/environments/*` | Environment configuration files |

## Usage Examples

### Before (Relative Paths)
```typescript
import { UserService } from '../../api/services/user.service';
import { UserDto } from '../../api/model/user.model';
import { ToastService } from '../../shared/services/toast.service';
import { KeycloakService } from '../security/keycloak.service';
import { environment } from '../../../environments/environment';
```

### After (Path Aliases)
```typescript
import { UserService } from '@api/services/user.service';
import { UserDto } from '@api/model/user.model';
import { ToastService } from '@shared/services/toast.service';
import { KeycloakService } from '@core/security/keycloak.service';
import { environment } from '@environments/environment';
```

## Benefits

1. **Cleaner Imports**: No more counting `../` levels
2. **Easier Refactoring**: Move files without breaking imports
3. **Better Readability**: Clear indication of what module is being imported
4. **Consistent Structure**: Standardized import patterns across the application
5. **IDE Support**: Better autocomplete and navigation

## When to Use Path Aliases

### Use Path Aliases For:
- **Cross-module imports**: When importing from different feature modules
- **API imports**: Services, models, and interfaces
- **Shared resources**: Components, services, and utilities used across features
- **Core functionality**: Guards, interceptors, and core services
- **Environment configs**: Configuration files

### Keep Relative Paths For:
- **Local imports**: When importing from the same directory or closely related files
- **Feature-specific models**: Types and interfaces specific to a feature
- **Local services**: Services that are only used within a feature module

## Examples by Category

### API Imports
```typescript
// ✅ Good - Use path aliases for API imports
import { UserService } from '@api/services/user.service';
import { WalletDto } from '@api/model/wallet.model';
import { Currency, Country } from '@api/model/common.model';

// ❌ Avoid - Relative paths for API imports
import { UserService } from '../../../api/services/user.service';
```

### Shared Resources
```typescript
// ✅ Good - Use path aliases for shared resources
import { ToastService } from '@shared/services/toast.service';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';

// ❌ Avoid - Relative paths for shared resources
import { ToastService } from '../../shared/services/toast.service';
```

### Core Services
```typescript
// ✅ Good - Use path aliases for core services
import { KeycloakService } from '@core/security/keycloak.service';
import { ResponsiveService } from '@core/services/responsive.service';

// ❌ Avoid - Relative paths for core services
import { KeycloakService } from '../security/keycloak.service';
```

### Local Feature Imports
```typescript
// ✅ Good - Keep relative paths for local feature imports
import { WalletFormService } from '../services/wallet-form.service';
import { WalletGoalProgress } from '../models/wallet.types';

// ✅ Also Good - Use path aliases for cross-feature imports
import { UserService } from '@api/services/user.service';
```

## Configuration

The path aliases are configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@shared/*": ["src/app/shared/*"],
      "@state/*": ["src/app/state/*"],
      "@core/*": ["src/app/core/*"],
      "@features/*": ["src/app/features/*"],
      "@api/*": ["src/app/api/*"],
      "@assets/*": ["src/assets/*"],
      "@environments/*": ["src/environments/*"],
      "@app/*": ["src/app/*"]
    }
  }
}
```

## Migration Guide

To migrate existing files to use path aliases:

1. **Identify relative imports** that cross module boundaries
2. **Replace with appropriate path aliases** based on the import destination
3. **Test the application** to ensure imports still work correctly
4. **Update any remaining relative imports** that would benefit from aliases

## IDE Support

Most modern IDEs (VS Code, WebStorm, etc.) will automatically recognize these path aliases and provide:
- Autocomplete suggestions
- Go-to-definition navigation
- Import organization
- Refactoring support

## Troubleshooting

If you encounter import errors after using path aliases:

1. **Check the alias spelling**: Ensure the alias matches exactly (case-sensitive)
2. **Verify the file path**: Make sure the target file exists at the specified path
3. **Restart the TypeScript service**: Sometimes IDEs need a restart to recognize new aliases
4. **Check tsconfig.json**: Ensure the paths are correctly configured
5. **Clear build cache**: Run `npm run clean` or delete the `dist` folder

## Best Practices

1. **Be consistent**: Use the same alias pattern across similar imports
2. **Group related imports**: Group imports by alias type (e.g., all @api imports together)
3. **Document complex aliases**: Add comments for non-obvious import paths
4. **Regular review**: Periodically review and update imports as the codebase evolves
