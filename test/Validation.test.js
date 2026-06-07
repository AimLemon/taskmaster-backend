import request from 'supertest';
import app from '../index.js';
import db from '../config/database.js';

describe('Validation Module - Agim', () => {
    // Test 1: Format email salah
    test('Agim 1: Register gagal jika format email tidak valid', async () => {
        const res = await request(app)
            .post('/users')
            .send({
                name: "Agim Test",
                email: "bukan-email-benar",
                password: "password123",
                confPassword: "password123"
            });
        expect(res.statusCode).toBe(400);
        expect(res.body.msg).toBe("Format email tidak valid!");
    });

    // Test 2: Password terlalu pendek
    test('Agim 2: Register gagal jika password kurang dari 6 karakter', async () => {
        const res = await request(app)
            .post('/users')
            .send({
                name: "Agim Test",
                email: "agim@gmail.com",
                password: "123",
                confPassword: "123"
            });
        expect(res.statusCode).toBe(400);
        expect(res.body.msg).toBe("Password minimal harus 6 karakter!");
    });

    afterAll(async () => { await db.close(); });
});