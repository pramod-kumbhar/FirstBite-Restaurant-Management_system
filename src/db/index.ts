import { mkdirSync } from "node:fs";
import { dirname, isAbsolute, join } from "node:path";
import Database from "better-sqlite3";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const isTurso = !!process.env.TURSO_CONNECTION_URL;

let db: any;
let client: any;

const globalForDb = globalThis as typeof globalThis & {
  __firstBiteSqliteClient?: Database.Database;
  __firstBiteLibsqlClient?: any;
  __firstBiteDbInitialized?: boolean;
};

if (isTurso) {
  const libsqlClient = globalForDb.__firstBiteLibsqlClient ?? createClient({
    url: process.env.TURSO_CONNECTION_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  if (process.env.NODE_ENV !== "production") {
    globalForDb.__firstBiteLibsqlClient = libsqlClient;
  }
  client = libsqlClient;
  db = drizzleLibsql(libsqlClient, { schema });
} else {
  const sqlitePath = process.env.SQLITE_PATH || "data/restaurant.db";
  const resolvedSqlitePath = sqlitePath === ":memory:" || isAbsolute(sqlitePath)
    ? sqlitePath
    : join(process.cwd(), sqlitePath);

  if (resolvedSqlitePath !== ":memory:") {
    mkdirSync(dirname(resolvedSqlitePath), { recursive: true });
  }

  const localClient = globalForDb.__firstBiteSqliteClient ?? new Database(resolvedSqlitePath);
  localClient.pragma("foreign_keys = ON");
  localClient.pragma("journal_mode = WAL");
  if (process.env.NODE_ENV !== "production") {
    globalForDb.__firstBiteSqliteClient = localClient;
  }
  client = localClient;
  db = drizzleSqlite(localClient, { schema });
}

const requiredForeignKeys: Record<string, string[]> = {
  chefs: ["user_id", "manager_id"],
  waiters: ["user_id", "manager_id"],
  cashiers: ["user_id", "manager_id"],
  menu_items: ["category_id"],
  reservations: ["customer_id", "table_id"],
  orders: ["customer_id", "table_id"],
  order_items: ["order_id", "menu_item_id"],
  inventory_items: ["supplier_id"],
  purchase_orders: ["supplier_id"],
  employee_shifts: ["user_id"],
  payments: ["order_id"],
  reviews: ["menu_item_id"],
};

async function tableExists(tableName: string): Promise<boolean> {
  if (isTurso) {
    const result = await client.execute({
      sql: "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
      args: [tableName],
    });
    return result.rows.length > 0;
  } else {
    const result = client
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?")
      .get(tableName);
    return Boolean(result);
  }
}

async function schemaNeedsRebuild(): Promise<boolean> {
  for (const [tableName, columns] of Object.entries(requiredForeignKeys)) {
    if (!(await tableExists(tableName))) {
      continue;
    }

    let foreignKeys: Array<{ from: string }>;
    if (isTurso) {
      const result = await client.execute(`PRAGMA foreign_key_list(${tableName})`);
      foreignKeys = result.rows.map((row: any) => ({ from: row.from }));
    } else {
      foreignKeys = client.prepare(`PRAGMA foreign_key_list(${tableName})`).all() as Array<{ from: string }>;
    }
    const foreignKeyColumns = new Set(foreignKeys.map((foreignKey) => foreignKey.from));

    for (const column of columns) {
      if (!foreignKeyColumns.has(column)) {
        return true;
      }
    }
  }

  return false;
}

async function dropSchema() {
  const sqlStr = `
    DROP TABLE IF EXISTS reviews;
    DROP TABLE IF EXISTS payments;
    DROP TABLE IF EXISTS order_items;
    DROP TABLE IF EXISTS orders;
    DROP TABLE IF EXISTS reservations;
    DROP TABLE IF EXISTS employee_shifts;
    DROP TABLE IF EXISTS purchase_orders;
    DROP TABLE IF EXISTS inventory_items;
    DROP TABLE IF EXISTS suppliers;
    DROP TABLE IF EXISTS menu_items;
    DROP TABLE IF EXISTS categories;
    DROP TABLE IF EXISTS restaurant_tables;
    DROP TABLE IF EXISTS cashiers;
    DROP TABLE IF EXISTS waiters;
    DROP TABLE IF EXISTS chefs;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS coupons;
    DROP TABLE IF EXISTS expenses;
  `;
  if (isTurso) {
    await client.executeMultiple(sqlStr);
  } else {
    client.exec(sqlStr);
  }
}

async function ensureSchema() {
  if (await schemaNeedsRebuild()) {
    console.warn("SQLite schema is missing required foreign keys. Rebuilding local tables.");
    await dropSchema();
  }

  const sqlStr = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL DEFAULT '',
      phone TEXT,
      address_line TEXT,
      district TEXT,
      state TEXT,
      pincode TEXT,
      role TEXT NOT NULL DEFAULT 'customer',
      pin TEXT,
      loyalty_points INTEGER NOT NULL DEFAULT 0,
      is_email_verified INTEGER NOT NULL DEFAULT 0,
      is_approved INTEGER NOT NULL DEFAULT 1,
      email_verification_token TEXT,
      email_verified_at INTEGER,
      password_reset_token TEXT,
      password_reset_expires_at INTEGER,
      branch TEXT NOT NULL DEFAULT 'Ichalkaranji',
      joined_at INTEGER NOT NULL DEFAULT (cast((julianday('now') - 2440587.5) * 86400000 as integer))
    );

    CREATE TABLE IF NOT EXISTS chefs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      status TEXT NOT NULL DEFAULT 'active',
      specialization TEXT,
      joined_at INTEGER NOT NULL DEFAULT (cast((julianday('now') - 2440587.5) * 86400000 as integer))
    );

    CREATE TABLE IF NOT EXISTS waiters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      status TEXT NOT NULL DEFAULT 'active',
      section TEXT,
      joined_at INTEGER NOT NULL DEFAULT (cast((julianday('now') - 2440587.5) * 86400000 as integer))
    );

    CREATE TABLE IF NOT EXISTS cashiers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      manager_id REFERENCES users(id) ON DELETE SET NULL,
      status TEXT NOT NULL DEFAULT 'active',
      shift_preference TEXT,
      joined_at INTEGER NOT NULL DEFAULT (cast((julianday('now') - 2440587.5) * 86400000 as integer))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      image_url TEXT
    );

    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      price TEXT NOT NULL,
      is_available INTEGER NOT NULL DEFAULT 1,
      is_vegetarian INTEGER NOT NULL DEFAULT 0,
      is_vegan INTEGER NOT NULL DEFAULT 0,
      is_gluten_free INTEGER NOT NULL DEFAULT 0,
      image_url TEXT,
      spice_level INTEGER NOT NULL DEFAULT 0,
      preparation_time INTEGER NOT NULL DEFAULT 15
    );

    CREATE TABLE IF NOT EXISTS restaurant_tables (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_number TEXT NOT NULL UNIQUE,
      capacity INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'available',
      qr_code_url TEXT
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      table_id INTEGER REFERENCES restaurant_tables(id) ON DELETE SET NULL,
      reservation_time INTEGER NOT NULL,
      number_of_guests INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      notes TEXT,
      branch TEXT NOT NULL DEFAULT 'Ichalkaranji',
      created_at INTEGER NOT NULL DEFAULT (cast((julianday('now') - 2440587.5) * 86400000 as integer))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      table_id INTEGER REFERENCES restaurant_tables(id) ON DELETE SET NULL,
      order_type TEXT NOT NULL DEFAULT 'dine-in',
      status TEXT NOT NULL DEFAULT 'pending',
      total_amount TEXT NOT NULL,
      gst_amount TEXT NOT NULL DEFAULT '0.00',
      discount_amount TEXT NOT NULL DEFAULT '0.00',
      final_amount TEXT NOT NULL,
      coupon_code TEXT,
      address TEXT,
      notes TEXT,
      branch TEXT NOT NULL DEFAULT 'Ichalkaranji',
      created_at INTEGER NOT NULL DEFAULT (cast((julianday('now') - 2440587.5) * 86400000 as integer)),
      updated_at INTEGER NOT NULL DEFAULT (cast((julianday('now') - 2440587.5) * 86400000 as integer))
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
      menu_item_id INTEGER REFERENCES menu_items(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL,
      unit_price TEXT NOT NULL,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'pending'
    );

    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      contact_person TEXT,
      email TEXT,
      phone TEXT,
      address TEXT
    );

    CREATE TABLE IF NOT EXISTS inventory_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      quantity TEXT NOT NULL,
      unit TEXT NOT NULL,
      reorder_level TEXT NOT NULL,
      cost_per_unit TEXT NOT NULL,
      supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
      updated_at INTEGER NOT NULL DEFAULT (cast((julianday('now') - 2440587.5) * 86400000 as integer))
    );

    CREATE TABLE IF NOT EXISTS purchase_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      supplier_id INTEGER REFERENCES suppliers(id) ON DELETE CASCADE,
      item_name TEXT NOT NULL,
      quantity TEXT NOT NULL,
      cost TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'ordered',
      ordered_at INTEGER NOT NULL DEFAULT (cast((julianday('now') - 2440587.5) * 86400000 as integer))
    );

    CREATE TABLE IF NOT EXISTS employee_shifts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      role TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'scheduled'
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
      amount TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'completed',
      transaction_id TEXT,
      created_at INTEGER NOT NULL DEFAULT (cast((julianday('now') - 2440587.5) * 86400000 as integer))
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      discount_type TEXT NOT NULL,
      discount_value TEXT NOT NULL,
      min_order_amount TEXT NOT NULL DEFAULT '0.00',
      expiry_date TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      menu_item_id INTEGER REFERENCES menu_items(id) ON DELETE CASCADE,
      customer_name TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT,
      created_at INTEGER NOT NULL DEFAULT (cast((julianday('now') - 2440587.5) * 86400000 as integer))
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      amount TEXT NOT NULL,
      date TEXT NOT NULL,
      created_by TEXT,
      created_at INTEGER NOT NULL DEFAULT (cast((julianday('now') - 2440587.5) * 86400000 as integer))
    );
  `;

  const indicesStr = `
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON menu_items(category_id);
    CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
    CREATE INDEX IF NOT EXISTS idx_orders_table_id ON orders(table_id);
    CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
    CREATE INDEX IF NOT EXISTS idx_order_items_menu_item_id ON order_items(menu_item_id);
    CREATE INDEX IF NOT EXISTS idx_reservations_reservation_time ON reservations(reservation_time DESC);
    CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_employee_shifts_date ON employee_shifts(date);
  `;

  if (isTurso) {
    await client.executeMultiple(sqlStr);
    await client.executeMultiple(indicesStr);
  } else {
    client.exec(sqlStr);
    client.exec(indicesStr);
  }
}

async function ensureDefaultManager() {
  const sqlStr = `
    INSERT INTO users (
      name,
      email,
      password,
      role,
      loyalty_points,
      is_email_verified,
      is_approved,
      branch
    )
    VALUES (
      'Manager',
      'manager@restaurant.com',
      '$2b$10$aUqfy97/8m/oubftaA6BOOw19R0sATawPIFFrpf4OOZRizeyyUGHO',
      'manager',
      0,
      1,
      1,
      'Ichalkaranji'
    )
    ON CONFLICT(email) DO UPDATE SET
      name = 'Manager',
      password = excluded.password,
      role = 'manager',
      is_email_verified = 1,
      is_approved = 1,
      branch = 'Ichalkaranji'
  `;

  if (isTurso) {
    await client.execute(sqlStr);
  } else {
    client.prepare(sqlStr).run();
  }
}

async function ensureDefaultOwner() {
  const sqlStr = `
    INSERT INTO users (
      name,
      email,
      password,
      role,
      loyalty_points,
      is_email_verified,
      is_approved,
      branch
    )
    VALUES (
      'Owner',
      'owner@restaurant.com',
      '$2b$10$aUqfy97/8m/oubftaA6BOOw19R0sATawPIFFrpf4OOZRizeyyUGHO',
      'owner',
      0,
      1,
      1,
      'Ichalkaranji'
    )
    ON CONFLICT(email) DO UPDATE SET
      name = 'Owner',
      password = excluded.password,
      role = 'owner',
      is_email_verified = 1,
      is_approved = 1,
      branch = 'Ichalkaranji'
  `;

  if (isTurso) {
    await client.execute(sqlStr);
  } else {
    client.prepare(sqlStr).run();
  }
}

// Background database initialization
const initPromise = (async () => {
  if (globalForDb.__firstBiteDbInitialized) return;
  try {
    await ensureSchema();
    await ensureDefaultManager();
    await ensureDefaultOwner();
    globalForDb.__firstBiteDbInitialized = true;
    console.log(isTurso ? "Turso Cloud Database initialized successfully." : "Local SQLite Database initialized successfully.");
  } catch (err) {
    console.error("Database initialization failed:", err);
  }
})();

export { client, db, initPromise };
