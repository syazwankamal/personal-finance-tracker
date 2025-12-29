import { db, type Expense } from '../db/db';
import { v4 as uuidv4 } from 'uuid';
import { uploadReceiptToS3, type S3Config } from './s3Service';

export const ExpenseService = {
    async addExpense(expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>, s3Config: S3Config): Promise<Expense> {
        const id = uuidv4();
        const now = new Date();
        const newExpense: Expense = {
            ...expenseData,
            id,
            createdAt: now,
            updatedAt: now
        };

        // 1. Add to Local DB
        await db.expenses.add(newExpense);

        // 2. Handle S3 Upload if needed
        if (s3Config.accessKeyId && expenseData.localReceipt) {
            try {
                const s3Key = await uploadReceiptToS3(s3Config, id, expenseData.localReceipt);
                await db.expenses.update(id, { receiptUrl: s3Key });
                newExpense.receiptUrl = s3Key;
            } catch (err) {
                console.error('S3 Receipt upload failed:', err);
                // We don't rollback the expense creation, just log the error
            }
        }

        return newExpense;
    },

    async updateExpense(id: string, updates: Partial<Expense>, s3Config: S3Config): Promise<Partial<Expense>> {
        const timestampUpdates = {
            ...updates,
            updatedAt: new Date()
        };

        // 1. Update Local DB
        await db.expenses.update(id, timestampUpdates);

        // 2. Handle S3 Upload if new file provided
        if (s3Config.accessKeyId && updates.localReceipt) {
            try {
                const s3Key = await uploadReceiptToS3(s3Config, id, updates.localReceipt);
                await db.expenses.update(id, { receiptUrl: s3Key });
                return { ...timestampUpdates, receiptUrl: s3Key };
            } catch (err) {
                console.error('S3 Receipt upload failed:', err);
            }
        }

        return timestampUpdates;
    },

    async deleteExpense(id: string): Promise<void> {
        await db.expenses.delete(id);
        // Note: We might want to delete the S3 object here too in the future
    }
};
