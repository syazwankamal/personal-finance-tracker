import Dexie, { type Table } from 'dexie';

export interface Expense {
    id: string;
    name: string;
    amount: number;
    category: string;
    tags: string[];
    timestamp: Date;
    createdAt?: Date;
    updatedAt?: Date;
    notes?: string;
    paymentMethod: string;
    isTaxDeductible: boolean;
    receiptUrl?: string;
    localReceipt?: Blob;
}

export interface Budget {
    id: string;
    category: string;
    limit: number;
    monthPeriod: string; // YYYY-MM
    createdAt?: Date;
    updatedAt?: Date;
}

export interface Setting {
    key: string;
    value: string;
}

export class FinanceDB extends Dexie {
    expenses!: Table<Expense>;
    budgets!: Table<Budget>;
    settings!: Table<Setting>;

    constructor() {
        super('FinanceDB');
        this.version(1).stores({
            expenses: 'id, name, amount, category, *tags, timestamp',
            budgets: 'id, category, monthPeriod',
            settings: 'key'
        });

        // Version 2: Add createdAt/updatedAt
        // Note: New fields don't strictly require a schema change in Dexie if not indexed,
        // but we might want to index them later. For now, we just declare the version.
        this.version(2).stores({
            expenses: 'id, name, amount, category, *tags, timestamp, createdAt',
            budgets: 'id, category, monthPeriod'
        });
    }
}

export const db = new FinanceDB();
