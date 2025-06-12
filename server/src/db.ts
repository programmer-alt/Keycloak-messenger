import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.envServer'});
class Database {
  private static instance: Pool;

  private constructor() {}

  public static getInstance(): Pool {
    if (!Database.instance) {
      const port = Number(process.env.DB_PORT);
      Database.instance = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: Number.isNaN(port) ? 5433 : port,
      });
    }
    return Database.instance;
  }
}
export default Database.getInstance(); // Singleton pattern
