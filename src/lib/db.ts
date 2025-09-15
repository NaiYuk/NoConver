// src/lib/db.ts
import mysql from "mysql2/promise";

// 開発時のHMRでコネクションを使い回す（推奨）
declare global {
  // eslint-disable-next-line no-var
  var __mysqlPool: mysql.Pool | undefined;
}

function getPool() {
  if (!global.__mysqlPool) {
    global.__mysqlPool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      timezone: '+09:00',
      port: Number(process.env.DB_PORT ?? 3306),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return global.__mysqlPool;
}

export async function getDbConnection() {
  return getPool();
}

export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const pool = getPool();
  const [rows] = await pool.execute(sql, params);
  return rows as T[];
}
