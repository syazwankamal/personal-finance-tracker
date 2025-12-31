# Feature Logic: Credit Card Settlements & Transaction Types(NO GO, focus on expense tracker core feature)

## 1. Context & Problem Statement
Currently, the personal finance tracker treats every logged item as an **"Expense"**. This simplifies the UI but creates a critical accounting error for credit card users:

1.  **The Spending Event**: User swipes card for RM 100 lunch.
    *   *Result*: Recorded as RM 100 Expense.
2.  **The Payment Event**: User pays the credit card bill of RM 100.
    *   *Result*: Recorded as another RM 100 Expense.

**The Issue**: The system reports RM 200 total spending. The user's budget "bursts" artificially because the same outflow is counted twice—once when incurred, and once when settled.

## 2. Financial Logic (The Thinking)
To resolve this, we must differentiate between **Spending** and **Movement of Funds**.

*   **Expense (Spending)**: Money flows out of your net worth permanently (e.g., Food, Rent).
    *   *Equation*: `Assets ↓` or `Liabilities ↑` (Net Worth ↓)
*   **Transfer (Settlement)**: Money moves from one account you own to another account (or debt) you own.
    *   *Equation*: `Assets ↓` and `Liabilities ↓` (Net Worth ↔️ Unchanged)

**Conclusion**: Credit Card Settlement is a **Transfer**, not an Expense. It is simply paying off a debt that was *already* counted as expenses when the transactions occurred.

## 3. Implementation Specifications

### 3.1 Data Model Changes
The `Expense` interface needs to evolve into a generic `Transaction` model (internally).

**Schema Update**:
Add a `type` field to the `Expense` object.
```typescript
interface Expense {
  // ... existing fields
  type: 'expense' | 'income' | 'transfer'; // New Field
}
```

### 3.2 UI/UX Changes

#### Add/Edit Form
*   **New Control**: Add a "Transaction Type" selector (Segmented Control).
    *   **Expense** (Default): Standard category selection.
    *   **Transfer**: Hides "Category" (or forces "Transfer" category). Ideal for CC payments.
    *   **Income**: For salary/dividends.
*   **Visual Cues**: Distinct colors for Income (Green), Expense (Black/Red), Transfer (Blue/Grey).

#### Dashboard & Analytics
*   **Spending Calculation**:
    *   `Total Spent = Sum(Transactions where type == 'expense')`
*   **Budgeting**:
    *   Transfers must be **EXCLUDED** from budget impact calculations.

### 3.3 Migration Strategy
Since current data lacks this field:
1.  **Backfill**: On app load, checking for missing `type`. Set default `type: 'expense'` for all existing records.
2.  **User Correction**: Users will need to manually find past "Settlement" entries and edit their type to 'Transfer' to fix historical charts.

## 4. Future Considerations
*   **Recurring Transfers**: Auto-detecting monthly settlements.
*   **Income Tracking**: Once `type` is available, we can easily add an "Income" dashboard without database changes.
