import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { db } from "../db/db";

export interface S3Config {
    bucket: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
}

export const uploadToS3 = async (
    config: S3Config,
    fileName: string,
    content: string | Blob,
    contentType: string = "application/json"
) => {
    const client = new S3Client({
        region: config.region,
        credentials: {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
        },
    });

    const command = new PutObjectCommand({
        Bucket: config.bucket,
        Key: fileName,
        Body: content,
        ContentType: contentType,
    });

    return await client.send(command);
};

export const performFullBackup = async (config: S3Config) => {
    const expenses = await db.expenses.toArray();
    const budgets = await db.budgets.toArray();
    const categories = await db.settings.get("categories");

    const backupData = {
        version: 1,
        timestamp: new Date().toISOString(),
        data: {
            expenses,
            budgets,
            categories: categories?.value ? JSON.parse(categories.value) : [],
        },
    };

    const fileName = `backups/finance_backup_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`;
    return await uploadToS3(config, fileName, JSON.stringify(backupData, null, 2));
};
