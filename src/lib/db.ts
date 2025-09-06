// lib/db.ts
import mysql from "mysql2/promise";

let pool: mysql.Pool;

export async function getDbConnection() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,       // Cloud SQL の IP またはホスト名
      user: process.env.DB_USER,       // DBユーザー
      password: process.env.DB_PASS,   // パスワード
      database: process.env.DB_NAME,   // DB名
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}
