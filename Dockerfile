# Gunakan versi Node.js yang kamu pakai (v22)
FROM node:22

# Tentukan direktori kerja di dalam container
WORKDIR /app

# Copy file package.json dan install library
COPY package*.json ./
RUN npm install

# Copy seluruh kode sumber
COPY . .

# Expose port backend
EXPOSE 5000

# Jalankan aplikasi
CMD ["npm", "start"]