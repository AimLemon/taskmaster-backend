import { Sequelize } from 'sequelize';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

// Validasi Environment Variables untuk Database
const requiredDbEnv = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT'];
for (const envVar of requiredDbEnv) {
  if (!process.env[envVar]) {
    console.error(`FATAL ERROR: Database environment variable ${envVar} is not defined.`);
    // Di lingkungan serverless, kita tidak bisa menggunakan process.exit()
    // Sebagai gantinya, kita throw error agar Vercel menangkapnya di log
    throw new Error(`Missing critical database environment variable: ${envVar}`);
  }
}

const db = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    dialectModule: pg,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false,
    pool: {
      max: 50,      // Maksimal koneksi simultan per worker
      min: 0,
      acquire: 60000, // Menambah waktu tunggu koneksi menjadi 60 detik untuk antrean tinggi
      idle: 10000
    }
  }
);

export default db;