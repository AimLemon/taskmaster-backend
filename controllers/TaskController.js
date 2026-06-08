import Tasks from "../models/TaskModel.js";

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
    const { subject, title, description, deadline, priority, color, attachment } = req.body;
    
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

        const { subject, title, description, deadline, priority, color, isCompleted, attachment } = req.body;
        const updateData = {
            subject, title, description, deadline, priority, color, isCompleted, attachment
        };
        
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

        await Tasks.destroy({
            where: { id: task.id }
        });
        res.status(200).json({ msg: "Tugas Berhasil Dihapus" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};