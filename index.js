import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import db from './config/database.js';
import router from './routes/UserRoute.js';
import path from 'path';

dotenv.config();

// Validasi awal Environment Variables
if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
    console.error("FATAL ERROR: JWT Secrets are not defined in .env file.");
    process.exit(1);
}

const app = express();

// 1. MIDDLEWARE
app.use(cors({ 
    credentials: true, 
    origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}));
app.use(cookieParser());
app.use(express.json());

const startServer = async () => {
    try {
        const PORT = process.env.PORT || 5001;
        await db.authenticate();
        await db.sync({ alter: true });
        console.log('Database connected & synchronized');

        // Hanya jalankan app.listen jika TIDAK di lingkungan Vercel
        if (!(process.env.VERCEL === '1' || !!process.env.NOW_REGION)) {
            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
            });
        }
    } catch (error) {
        console.error('Database connection error:', error.message);
    }
};

// Jalankan inisialisasi DB
startServer();

// 2. ROUTES
app.use(router);

export default app;