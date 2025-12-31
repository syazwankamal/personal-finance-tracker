export const APP_VERSION = __APP_VERSION__;

// Schema Version for IndexedDB migrations
// Increment this number whenever the database schema changes (e.g. adding new stores)
// Version 1: Initial release (Expenses, Budgets, Settings)
// Version 2: Added createdAt/updatedAt to Expense
// Version 3: Added Recurring Expenses
export const SCHEMA_VERSION = 2; // Matching current db.ts version
