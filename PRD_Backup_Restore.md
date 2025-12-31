# PRD: Backup & Restore (Multi-Device Support)

## 1. Overview
**Goal:** Enable users to move their financial data between devices (e.g., Laptop ↔ Phone) and secure their data against device loss, without requiring a central server or account creation.

**Strategy:** A **"Suitcase" Model**. The user packs their data into a portable file (Export) and unpacks it on another device (Import).
**Mechanism:** Manual File Export/Import using a ZIP archive containing structured JSON data and raw image assets.
**Conflict Resolution:** **Wipe & Replace**. Importing a backup completely overwrites the current device's local database.

## 2. User Stories
*   **As a user**, I want to download a backup of all my expenses and receipts so I can switch to a new phone without losing data.
*   **As a user**, I want to transfer my data from my computer to my mobile phone so I can add expenses on the go.
*   **As a user**, I want to restore my data from a backup file so I can recover if I clear my browser cache accidentally.

## 3. The Backup File Format
The system will generate a `.zip` archive (suggested filename: `finance_backup_YYYY-MM-DD.zip`).

**Internal Structure:**
```text
backup.zip
├── data.json           # The relational data
└── images/             # The binary assets
    ├── {expense_id_1}  # Raw image blob for Expense 1
    ├── {expense_id_2}  # Raw image blob for Expense 2
    └── ...
```

**`data.json` Schema:**
```json
{
  "version": 1,
  "timestamp": "2025-12-31T10:00:00.000Z",
  "metadata": {
    "appVersion": "1.0.0",
    "deviceType": "web"
  },
  "data": {
    "expenses": [ ... ], // Array of Expense objects (excluding Blobs)
    "budgets": [ ... ],  // Array of Budget objects
    "settings": [ ... ]  // Array of Setting objects
  }
}
```

## 4. Functional Requirements

### 4.1. Export (Backup)
1.  **Trigger:** Button in Settings > "Data Management" > "Export Backup".
2.  **Process:**
    *   Query all tables (`expenses`, `budgets`, `settings`) from `IndexedDB`.
    *   Iterate through `expenses`. If an expense has a `localReceipt` (Blob):
        *   Add the Blob to the ZIP's `images/` folder using the Expense ID as the filename.
        *   Ensure the JSON object *excludes* the Blob field (to avoid duplication/serialization errors).
    *   Serialize remaining text data into `data.json`.
    *   Generate ZIP file using `JSZip`.
3.  **Output:** Browser triggers a file download of the ZIP.

### 4.2. Import (Restore)
1.  **Trigger:** Button in Settings > "Data Management" > "Restore Backup".
2.  **Input:** User selects a local `.zip` file.
3.  **Process:**
    *   **Validation:**
        *   Unzip file.
        *   Check for existence of `data.json`.
        *   Parse JSON and verify schema version.
    *   **Reconstruction:**
        *   Load `data.json` into memory.
        *   Iterate through `expenses`. Check `images/` folder for a matching file (Expense ID).
        *   If image exists, read it as a Blob and attach it to the `localReceipt` property of the expense object.
    *   **Database Write (Atomic Transaction):**
        *   **Clear** all existing data in `expenses`, `budgets`, and `settings` tables.
        *   **Bulk Add** the reconstructed objects.
4.  **Post-Process:**
    *   Trigger a full application reload (`window.location.reload()`) to ensure the Zustand store and UI reflect the new database state.

## 5. Data Integrity & Schema Migration
To ensure compatibility as the application evolves, the system must handle backups created with older versions of the application.

### 5.1. Version Tagging
*   **Export:** Every generated `data.json` MUST include a top-level `version` integer (e.g., `"version": 1`).
*   **Definition:** This version number corresponds to the database schema version defined in the code (`CURRENT_SCHEMA_VERSION`).

### 5.2. Migration Logic (Import Pipeline)
When importing a backup:
1.  **Check Version:** Read `backup.version`.
2.  **Case A: version == CURRENT_VERSION:**
    *   Proceed with standard import.
3.  **Case B: version < CURRENT_VERSION:**
    *   Execute sequential migration functions to transform data structure to match the current schema.
    *   *Example:* If version 1 lacks a `currency` field, the migration injects `currency: "MYR"` into every expense object.
4.  **Case C: version > CURRENT_VERSION:**
    *   **BLOCK Import.** Display error: "Backup is from a newer version of the app. Please update your app to restore this data."
    *   *Reasoning:* Backward compatibility (loading new data into old code) is unsafe and undefined.

### 5.3. Default Fallbacks
*   Legacy backups (created before versioning was implemented) should be treated as `version: 0`.

## 6. User Experience (UX)

### 6.1. The "Wipe" Warning
Before the Import process begins, the user must explicitly confirm the destructive action.

> **⚠️ Warning: Overwrite Data?**
> Restoring this backup will **replace all current data** on this device. This action cannot be undone.
> [ Cancel ] [ Yes, Overwrite ]

### 6.2. Success Feedback
Upon successful restore:
> **Success!**
> Data restored successfully. The app will now reload.

### 6.3. Error Handling
*   **Invalid File:** "This does not appear to be a valid backup file."
*   **Corrupt Data:** "Unable to read backup data. The file might be corrupted."
*   **Version Mismatch:** "This backup is from a newer version of the app. Please update the app first."

## 7. Technical Dependencies
*   **Library:** `jszip` (v3.10.1 or later)
    *   Used for client-side compression and decompression.
*   **Storage:** `IndexedDB` (via `Dexie.js`)
    *   Target for data operations.

## 8. Future Considerations (Out of Scope)
*   **Cloud Sync:** Direct integration with Google Drive / Dropbox.
*   **Merging:** Intelligent conflict resolution to allow adding data on two devices simultaneously.
*   **Encryption:** Password-protecting the ZIP file.
