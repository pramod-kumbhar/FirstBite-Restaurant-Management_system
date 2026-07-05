import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsMysqlPool?: mysql.Pool;
};

let pool: mysql.Pool;
let db: ReturnType<typeof drizzle> | any;

if (!databaseUrl) {
  console.warn("DATABASE_URL is not configured. The app will start in a degraded mode until a valid MySQL connection string is set.");
  pool = mysql.createPool({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "",
    database: "restaurant_db",
    waitForConnections: true,
    connectionLimit: 1,
    queueLimit: 0,
  });
} else {
  pool =
    globalForDb.__arenaNextJsMysqlPool ??
    mysql.createPool({
      uri: databaseUrl,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__arenaNextJsMysqlPool = pool;
  }
}

db = drizzle(pool, { schema, mode: "default" as const });

async function ensureUserApprovalColumn() {
  try {
    const [rows] = await pool.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'is_approved'`
    );
    const columns = Array.isArray(rows) ? rows : [];
    if (columns.length === 0) {
      await db.execute(`ALTER TABLE users ADD COLUMN is_approved BOOLEAN NOT NULL DEFAULT TRUE`);
    }
  } catch (error) {
    console.warn('Unable to verify user approval column:', error);
  }
}

async function ensurePasswordResetColumns() {
  try {
    const [rows] = await pool.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME IN ('password_reset_token', 'password_reset_expires_at')`
    );
    const columns = Array.isArray(rows) ? rows.map((row: any) => row.COLUMN_NAME) : [];

    if (!columns.includes('password_reset_token')) {
      await db.execute(`ALTER TABLE users ADD COLUMN password_reset_token VARCHAR(255) NULL`);
    }
    if (!columns.includes('password_reset_expires_at')) {
      await db.execute(`ALTER TABLE users ADD COLUMN password_reset_expires_at TIMESTAMP NULL`);
    }
  } catch (error) {
    console.warn('Unable to verify password reset columns:', error);
  }
}

async function ensureStaffTables() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS chefs (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED UNIQUE,
        manager_id BIGINT UNSIGNED NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'active',
        specialization VARCHAR(100),
        joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_chefs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_chefs_manager FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS waiters (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED UNIQUE,
        manager_id BIGINT UNSIGNED NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'active',
        section VARCHAR(100),
        joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_waiters_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_waiters_manager FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS cashiers (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED UNIQUE,
        manager_id BIGINT UNSIGNED NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'active',
        shift_preference VARCHAR(100),
        joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_cashiers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_cashiers_manager FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
  } catch (error) {
    console.warn('Unable to ensure staff tables:', error);
  }
}

void ensureUserApprovalColumn();
void ensurePasswordResetColumns();
void ensureStaffTables();

export { pool, db };
