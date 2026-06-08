import Users from "../models/UserModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const getUsers = async (req, res) => {
    try {
        const users = await Users.findAll({
            attributes: ['id', 'name', 'email']
        });
        res.json(users);
    } catch (error) {
        console.log(error);
    }
}

export const Register = async (req, res) => {
    const { name, email, password, confPassword } = req.body;
    
    // Validasi dasar
    if (!name || !email || !password) return res.status(400).json({ msg: "Semua field harus diisi" });
    if (password.length < 6) return res.status(400).json({ msg: "Password minimal harus 6 karakter" });
    if (password !== confPassword) return res.status(400).json({ msg: "Password dan Confirm Password tidak cocok" });

    try {
        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(password, salt);
        await Users.create({
            name: name,
            email: email,
            password: hashPassword
        });
        return res.status(201).json({ msg: "Register Berhasil" });
    } catch (error) {
        console.error("Register Error:", error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ msg: "Email sudah terdaftar!" });
        }
        return res.status(500).json({ msg: "Terjadi kesalahan pada server: " + error.message });
    }
}

export const Login = async (req, res) => {
    try {
        const user = await Users.findOne({
            where: { email: req.body.email }
        });
        
        if (!user) return res.status(404).json({ msg: "Email tidak terdaftar!" });

        if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
            console.error("ERROR: JWT Secret belum dikonfigurasi di file .env!");
            return res.status(500).json({ msg: "Konfigurasi server salah: Secret key hilang" });
        }

        const match = await bcrypt.compare(req.body.password, user.password);
        if (!match) return res.status(400).json({ msg: "Password salah!" });
        const userId = user.id;
        const name = user.name;
        const email = user.email;
        const accessToken = jwt.sign({ userId, name, email }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '15m' // Access Token singkat lebih aman
        });
        const refreshToken = jwt.sign({ userId, name, email }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: '1d'
        });
        await Users.update({ refresh_token: refreshToken }, {
            where: { id: userId }
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === 'production', // true jika di production
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        });
        res.json({ accessToken });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: error.message || "Terjadi kesalahan pada server" });
    }
}

// INI FUNGSI YANG HILANG TADI
export const Logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(204);
    const user = await Users.findOne({
        where: {
            refresh_token: refreshToken
        }
    });
    if (!user) return res.sendStatus(204);
    const userId = user.id;
    await Users.update({ refresh_token: null }, {
        where: {
            id: userId
        }
    });
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
    return res.sendStatus(200);
}

export const updateUser = async (req, res) => {
    const { name, email } = req.body;
    try {
        await Users.update({ name, email }, {
            where: {
                id: req.params.id
            }
        });
        res.json({ msg: "Update Berhasil" });
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
}