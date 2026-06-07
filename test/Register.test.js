import request from 'supertest';
import app from '../index.js';
import db from '../config/database.js';

describe('Registration Module - Safri', () => {
    // Test 1: Email duplikat
    test('Safri 1: Register gagal jika email sudah terdaftar', async () => {
        const res = await request(app)
            .post('/users')
            .send({
                name: "Safri User",
                email: "ady123@gmail.com", // Email yang sudah ada
                password: "password123",
                confPassword: "password123"
            });
        expect(res.statusCode).toBe(400);
        expect(res.body.msg).toBe("Email sudah terdaftar!");
    });

    // Test 2: Konfirmasi password tidak cocok
    test('Safri 2: Register gagal jika confirm password tidak sama', async () => {
        const res = await request(app)
            .post('/users')
            .send({
                name: "Safri Baru",
                email: "baru@gmail.com",
                password: "password123",
                confPassword: "beda_password"
            });
        expect(res.statusCode).toBe(400);
        expect(res.body.msg).toBe("Password dan Confirm Password tidak cocok!");
    });

    afterAll(async () => { await db.close(); });
});