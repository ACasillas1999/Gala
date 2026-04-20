import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: import.meta.env.DB_HOST || '127.0.0.1',
  port: Number(import.meta.env.DB_PORT) || 3306,
  database: import.meta.env.DB_NAME || 'gala',
  user: import.meta.env.DB_USER || 'root',
  password: import.meta.env.DB_PASS || '',
  waitForConnections: true,
  connectionLimit: 10,
});

export default pool;
