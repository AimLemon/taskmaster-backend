import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import db from './config/database.js';
import router from './routes/UserRoute.js';
import path from 'path';
import fs from 'fs';
import cluster from 'cluster';
import os from 'os';

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
app.use('/uploads', express.static('uploads'));

// Pastikan folder uploads ada
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

// 2. ROUTES
app.use(router);

// 3. DATABASE & SERVER START
if (cluster.isPrimary) {
    // Sinkronisasi database dilakukan sekali di proses utama
    try {
        await db.authenticate();
        await db.sync({ alter: true });
        console.log('Database synchronized by Primary process');
    } catch (err) {
        console.error('Initial DB connection failed:', err.message);
    }

    const numCPUs = os.cpus().length;
    console.log(`Primary ${process.pid} is running. Forking for ${numCPUs} CPUs...`);

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker) => {
        console.log(`Worker ${worker.process.pid} died. Restarting...`);
        cluster.fork();
    });
} else {
    const startServer = async () => {
        try {
            const PORT = process.env.PORT || 5001;
            app.listen(PORT, () => {
                console.log(`Worker ${process.pid} started on port ${PORT}`);
            });
        } catch (error) {
            console.error('Worker failed to start:', error.message);
        }
    };
    startServer();
}

export default app;