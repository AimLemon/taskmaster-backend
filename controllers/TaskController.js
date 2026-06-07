import Tasks from "../models/TaskModel.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Konfigurasi Penyimpanan Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

export const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // Batas 10MB
});

// GET ALL TASKS
export const getTasks = async (req, res) => {
    try {
        const response = await Tasks.findAll({
            where: { userId: req.userId },
            order: [['createdAt', 'DESC']]
        });
        res.json(response);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

// CREATE TASK
export const createTask = async (req, res) => {
    const { subject, title, description, deadline, priority, color } = req.body;
    const attachment = req.file ? req.file.filename : null;
    
    try {
        await Tasks.create({
            subject, title, description, deadline, priority, color, attachment,
            userId: req.userId 
        });
        res.status(201).json({ msg: "Tugas Berhasil Dibuat!" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

// UPDATE TASK
export const updateTask = async (req, res) => {
    try {
        const task = await Tasks.findOne({
            where: { id: req.params.id, userId: req.userId }
        });
        if (!task) return res.status(404).json({ msg: "Tugas tidak ditemukan" });

        const { subject, title, description, deadline, priority, color, isCompleted } = req.body;
        const updateData = {
            subject, title, description, deadline, priority, color, isCompleted
        };
        
        if (req.file) updateData.attachment = req.file.filename;

        await Tasks.update({
            ...updateData
        }, {
            where: { id: task.id }
        });
        res.status(200).json({ msg: "Tugas Berhasil Diperbarui" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

// DELETE TASK
export const deleteTask = async (req, res) => {
    try {
        const task = await Tasks.findOne({
            where: { id: req.params.id, userId: req.userId }
        });
        if (!task) return res.status(404).json({ msg: "Tugas tidak ditemukan" });

        // Hapus file fisik jika ada attachment
        if (task.attachment) {
            const filePath = path.join("uploads", task.attachment);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        await Tasks.destroy({
            where: { id: task.id }
        });
        res.status(200).json({ msg: "Tugas Berhasil Dihapus" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};