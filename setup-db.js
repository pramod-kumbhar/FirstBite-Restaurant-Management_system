const { mkdirSync } = require('node:fs');
const { dirname, join } = require('node:path');
const Database = require('better-sqlite3');

const dbPath = process.env.SQLITE_PATH || join(process.cwd(), 'data', 'restaurant.db');
mkdirSync(dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

db.exec(`
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
    joined_at INTEGER NOT NULL DEFAULT (cast((julianday('now') - 2440587.5) * 86400000 as integer))
  );
`);

console.log(`SQLite database ready at ${dbPath}`);
db.close();
