const mysql = require('mysql2/promise');
(async () => {
  const conn = await mysql.createConnection({ host: '127.0.0.1', port: 3306, user: 'root', password: 'Pamms@2002' });
  await conn.query('CREATE DATABASE IF NOT EXISTS restaurant_db');
  await conn.query('USE restaurant_db');
  await conn.query(`CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL DEFAULT '',
    phone VARCHAR(20),
    role VARCHAR(30) NOT NULL DEFAULT 'customer',
    pin VARCHAR(6),
    loyalty_points INT NOT NULL DEFAULT 0,
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    email_verified_at TIMESTAMP NULL,
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await conn.query(`CREATE TABLE IF NOT EXISTS chefs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    manager_id INT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'active',
    specialization VARCHAR(100),
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_chefs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_chefs_manager FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
  )`);
  await conn.query(`CREATE TABLE IF NOT EXISTS waiters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    manager_id INT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'active',
    section VARCHAR(100),
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_waiters_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_waiters_manager FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
  )`);
  await conn.query(`CREATE TABLE IF NOT EXISTS cashiers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    manager_id INT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'active',
    shift_preference VARCHAR(100),
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cashiers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_cashiers_manager FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
  )`);
  console.log('users and staff tables ready');
  await conn.end();
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
