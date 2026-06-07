import express from "express";
import { 
    getUsers, 
    Register, 
    Login, 
    Logout 
} from "../controllers/UserController.js";
import { 
    getTasks, 
    createTask, 
    updateTask, 
    deleteTask,
    upload
} from "../controllers/TaskController.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import { refreshToken } from "../controllers/RefreshToken.js";

const router = express.Router();

// --- 1. ROUTES TANPA PROTEKSI (Letakkan di paling atas) ---
router.post('/login', Login); 
router.post('/users', Register);
router.get('/token', refreshToken);

// --- 2. ROUTES DENGAN PROTEKSI (verifyToken) ---
router.get('/users', verifyToken, getUsers);
router.delete('/logout', Logout);

// Task Routes
router.get('/tasks', verifyToken, getTasks);
router.post('/tasks', verifyToken, upload.single('attachment'), createTask);
router.patch('/tasks/:id', verifyToken, upload.single('attachment'), updateTask); 
router.delete('/tasks/:id', verifyToken, deleteTask); 

export default router;