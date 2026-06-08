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
// Pada Free Tier (Render/Heroku), sebaiknya tidak menggunakan cluster karena RAM terbatas
const isProduction = process.env.NODE_ENV === 'production';
const useCluster = !isProduction; // Matikan cluster di production

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
        
        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT} (PID: ${process.pid})`);
        });
    } catch (error) {
        console.error('Server failed to start:', error.message);
    }
}

export default app;