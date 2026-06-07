import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '1m', target: 3000 },  // Ramp-up lebih agresif ke 3.000 user
        { duration: '4m', target: 10000 }, // Mencapai target 10.000 dalam 4 menit
        { duration: '12m', target: 10000 },// Durasi soak test lebih lama (12 menit)
        { duration: '2m', target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(95)<800'], // Batas durasi sedikit lebih longgar (800ms)
        http_req_failed: ['rate<0.05'],   // Batas error sedikit lebih tinggi (5%)
    },
    setupTimeout: '4m',
};

const BASE_URL = 'http://localhost:5001';

export function setup() {
    const res = http.post(`${BASE_URL}/login`, JSON.stringify({
        email: 'Agim@gmail.com',
        password: 'Agim123',
    }), { headers: { 'Content-Type': 'application/json' } });

    if (res.status !== 200) {
        console.error(`Setup failed: Login returned status ${res.status}. Body: ${res.body}`);
        return { token: '' };
    }
    
    return { token: res.json().accessToken };
}

export default function (data) {
    const authParams = {
        headers: {
            'Authorization': `Bearer ${data.token}`,
            'Content-Type': 'application/json',
        },
    };

    // 1. Simulasi Fitur Pencarian (Search)
    // Menggunakan query string untuk menguji logika filter di Database
    const searchRes = http.get(`${BASE_URL}/tasks?subject=Project`, authParams);

    check(searchRes, {
        'search status is 200': (r) => r.status === 200,
        'search response time OK': (r) => r.timings.duration < 1500,
    });

    sleep(1);

    // 2. Simulasi Mengecek Daftar User (Navigasi Profil)
    const profileRes = http.get(`${BASE_URL}/users`, authParams);
    check(profileRes, {
        'profile check status is 200': (r) => r.status === 200,
    });

    // Memberi jeda antar aksi seperti pengguna nyata (1-3 detik)
    sleep(Math.random() * 2 + 1);
}