OpenAPI TypeScript Client Generation for Pockito

Use the openapi.json file to automatically generate TypeScript API clients under the api/ directory.

🗂 Directory Structure

Generate all service classes (one per controller) inside api/services.

Generate all model classes inside api/models.

Generate all enums separately inside api/models/enum.

🧩 Enum Format

Enums must be generated as TypeScript enum declarations, not as union types.

✅ Correct format:

export enum Currency {
  JPY = 'JPY',
  CNY = 'CNY',
}


❌ Incorrect format:

export type Currency = 'JPY' | 'CNY';

🧱 Model & Naming Rules

For response models, do not include the Response suffix.

Example:

TransactionResponse → Transaction
WalletListResponse → WalletList
etc.
For request models, keep the Request suffix.

Example:

TransactionRequest → TransactionRequest

🕒 Date & ID Field Rules

All fields representing dates in RESPONSE models (e.g., createdAt, updatedAt, transactionDate, etc.) must use the TypeScript Date type.

Fields representing IDs (e.g., id, userId, transactionId, etc.) should remain as string or number based on the OpenAPI definition, but ensure dates are not left as strings.

This ensures consistent and strongly typed handling of identifiers and temporal data in frontend models.


🎯 Goal

This setup ensures:

Clean separation between generated code and custom logic.

Safe regeneration of updated API methods without overwriting developer-written code.

Strongly typed, maintainable, and production-ready TypeScript API clients aligned with the Pockito backend OpenAPI specification.

Consistent model design with proper Date types, clear naming conventions, and organized enums.