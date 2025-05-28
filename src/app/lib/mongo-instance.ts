// lib/mongodb-singleton.ts
import { MongoClient, Db } from "mongodb";

class MongoDBSingleton {
  private static instance: MongoDBSingleton;
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): MongoDBSingleton {
    if (!MongoDBSingleton.instance) {
      MongoDBSingleton.instance = new MongoDBSingleton();
    }
    return MongoDBSingleton.instance;
  }

  public async connect(): Promise<Db> {
    if (this.isConnected && this.db) {
      return this.db;
    }

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not defined");
    }

    try {
      this.client = new MongoClient(process.env.MONGODB_URI);
      await this.client.connect();
      this.db = this.client.db();
      this.isConnected = true;

      console.log("Successfully connected to MongoDB");
      return this.db;
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      this.isConnected = false;
      console.log("Disconnected from MongoDB");
    }
  }

  public getDb(): Db {
    if (!this.db || !this.isConnected) {
      throw new Error("Database not connected. Call connect() first.");
    }
    return this.db;
  }

  public isDbConnected(): boolean {
    return this.isConnected;
  }
}

export default MongoDBSingleton;
