import request from 'supertest';
import app from '../index.js';
import db from '../config/database.js';

describe('Auth Module - Adyansyah', () => {
    // Test 1: Email tidak terdaftar
    test('Ady 1: Login gagal jika email tidak terdaftar', async () => {
        const res = await request(app)
            .post('/login')
            .send({
                email: "user_palsu@gmail.com",
                password: "password123"
            });
        expect(res.statusCode).toBe(404);
        expect(res.body.msg).toBe("Email tidak terdaftar!");
    });

    // Test 2: Password salah
    test('Ady 2: Login gagal jika password tidak cocok', async () => {
        const res = await request(app)
            .post('/login')
            .send({
                email: "ady123@gmail.com", // Pastikan email ini ada di DB
                password: "salah_password"
            });
        expect(res.statusCode).toBe(400);
        expect(res.body.msg).toBe("Password salah!");
    });

    afterAll(async () => { await db.close(); });
});