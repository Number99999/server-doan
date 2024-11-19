import dotenv from 'dotenv';
import path from 'path';
import { MongoClient, Db } from 'mongodb';

dotenv.config({ path: path.join(process.cwd(), (process.env.ENV_PATH || ""), ".env") });

class Database {
    private static instance: Database;
    private client: MongoClient;
    private db: Db;

    private constructor(uri: string, dbName: string) {
        this.client = new MongoClient(uri);
        this.db = this.client.db(dbName);
    };

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database(process.env.MONGO_URI as string, process.env.DB_NAME as string);
        }
        return Database.instance;
    };

    public async getDb(): Promise<Db> {
        if (!this.db) {
            await this.connect();
        }
        return this.db;
    };

    public getClient(): MongoClient {
        return this.client;
    };

    private async connect() {
        await this.client.connect();
    };
};

export default Database;