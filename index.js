import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import db from './config/database.js';
import router from './routes/UserRoute.js';

dotenv.config();

// Validasi awal Environment Variables
if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
    console.error("FATAL ERROR: JWT Secrets are not defined in .env file.");
}

const app = express();

// 1. MIDDLEWARE
app.use(cors({ 
    credentials: true, 
    origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}));
app.use(cookieParser());
app.use(express.json());

// 2. ROUTES (Daftarkan sebelum inisialisasi async agar Vercel segera mengenali endpoint)
app.use(router);

// 3. DATABASE CONNECTION (Tanpa wrapper async di level atas agar lebih responsif)
db.authenticate()
    .then(() => {
        console.log('Database connected...');
        // Hanya lakukan sync & listen jika TIDAK di lingkungan Vercel
        if (!(process.env.VERCEL === '1' || !!process.env.NOW_REGION)) {
            db.sync({ alter: true }).then(() => {
                const PORT = process.env.PORT || 5001;
                app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
            });
        }
    })
    .catch(err => {
        console.error('Database connection error:', err.message);
    });

export default app;