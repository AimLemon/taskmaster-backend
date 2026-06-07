import { Sequelize } from "sequelize";
import db from "../config/database.js";
import Users from "./UserModel.js";

const { DataTypes } = Sequelize;

const Tasks = db.define('tasks', {
    subject: { type: DataTypes.STRING, allowNull: false }, // Nama Mata Kuliah
    title: { type: DataTypes.STRING, allowNull: false },   // Judul Tugas
    description: { type: DataTypes.TEXT },                 // Detail Tugas
    deadline: { type: DataTypes.DATEONLY, allowNull: false },
    priority: { type: DataTypes.STRING, defaultValue: 'Biasa' }, // Biasa/Penting/Utama
    color: { type: DataTypes.STRING, defaultValue: '#3b82f6' },   // Kode Warna Hex
    isCompleted: { type: DataTypes.BOOLEAN, defaultValue: false },
    attachment: { type: DataTypes.STRING }                 // Nama file lampiran
}, { freezeTableName: true });
// Relasi: Satu User bisa punya banyak Tugas
Users.hasMany(Tasks);
Tasks.belongsTo(Users, { foreignKey: 'userId' });

export default Tasks;