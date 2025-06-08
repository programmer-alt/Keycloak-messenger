import { Pool } from 'pg';

// Настройки подключения к базе данных Postgres
const pool = new Pool({
  user: process.env.PG_USER || 'postgres',
  host: process.env.PG_HOST || 'localhost',
  database: process.env.PG_DATABASE || 'messenger',
  password: process.env.PG_PASSWORD || 'password',
  port: Number(process.env.PG_PORT) || 5433,
});


export default pool;
