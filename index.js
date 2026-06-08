import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import db from './config/database.js';
import router from './routes/UserRoute.js';
import path from 'path';
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

// 2. ROUTES
app.use(router);

// 3. DATABASE & SERVER START
const isProduction = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === '1';
const useCluster = !isProduction && !isVercel; // Matikan cluster di production atau Vercel

if (cluster.isPrimary && useCluster) {
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
    // Jika tidak pakai cluster, langsung jalankan server
    try {
        const PORT = process.env.PORT || 5001;
        // Untuk proses utama di production
        if (!useCluster) {
            await db.authenticate();
            await db.sync({ alter: true });
            console.log('Database synchronized (No-Cluster mode)');
        }
        
        // Di Vercel, kita tidak memanggil app.listen()
        if (!isVercel) {
            app.listen(PORT, () => {
                console.log(`Server started on port ${PORT} (PID: ${process.pid})`);
            });
        }
    } catch (error) {
        console.error('Server failed to start:', error.message);
    }
}

export default app;