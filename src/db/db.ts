import Dexie, { type Table } from 'dexie';

export interface Expense {
    id: string;
    name: string;
    amount: number;
    category: string;
    tags: string[];
    timestamp: Date;
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
    }
}

export const db = new FinanceDB();
