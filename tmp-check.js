const mysql = require('mysql2/promise');
(async () => {
  try {
    const conn = await mysql.createConnection({ host: '127.0.0.1', port: 3306, user: 'root', password: '1234' });
    console.log('connected');
    const [rows] = await conn.query('SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = "restaurant_db"');
    console.log(rows);
    await conn.end();
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
})();
