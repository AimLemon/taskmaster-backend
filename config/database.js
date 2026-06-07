import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const db = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
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