# 🚀 Quick Start Guide

ยินดีต้อนรับสู่ Information Aggregator & Search Platform! ต่อไปนี้คือวิธีการเริ่มต้นอย่างรวดเร็ว

---

## ⚡ เริ่มต้นด้วย NPM (แนะนำสำหรับผู้เริ่มต้น)

### 1. ติดตั้ง Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Frontend จะเปิดได้ที่ **http://localhost:3000**

### 2. ติดตั้ง Backend

ในหน้าต่าง Terminal ใหม่:

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Backend จะเปิดได้ที่ **http://localhost:5000**

---

## 🐳 เริ่มต้นด้วย Docker

```bash
# ก่อนอื่น ตรวจสอบว่า Docker ติดตั้งแล้ว
docker --version

# เรียกใช้ทั้งหมด
docker-compose up
```

Frontend: **http://localhost:3000**  
Backend: **http://localhost:5000**

---

## 📁 โครงสร้าง

```
project/
├── frontend/          # React/Vite app
├── backend/           # Express.js API
├── README.md          # เอกสารประกอบ
├── AGENTS.md          # AI Agents guide
├── copilot-instructions.md  # Copilot instructions
└── docker-compose.yml # Docker configuration
```

---

## 🔧 Commands ที่สำคัญ

### Frontend
```bash
npm run dev      # เรียกใช้ development server
npm run build    # Build สำหรับ production
npm run lint     # Linting
```

### Backend
```bash
npm run dev      # เรียกใช้ development server
npm start        # เรียกใช้ production
npm run migrate:local  # สร้าง database schema
```

---

## ✅ ตรวจสอบการติดตั้ง

1. **Frontend**: เปิด http://localhost:3000 - คุณควรเห็น Landing Page
2. **Backend**: เปิด http://localhost:5000/health - ควรเห็น `{"status":"OK"}`

---

## 📚 เอกสารเพิ่มเติม

- [README.md](./README.md) - เอกสารประกอบทั้งหมด
- [AGENTS.md](./AGENTS.md) - Architecture & conventions
- [copilot-instructions.md](./copilot-instructions.md) - Code guidelines

---

## ❓ ปัญหาทั่วไป

### Port 3000/5000 ใช้ไปแล้ว
```bash
# ค้นหา process ที่ใช้ port
# Windows
netstat -ano | findstr :3000
# Mac/Linux
lsof -i :3000
```

### Node modules ไม่ติดตั้ง
```bash
rm -rf node_modules package-lock.json
npm install
```

### Database errors
```bash
rm -rf backend/data/database.sqlite
npm run migrate:local
```

---

**🎉 แค่นั้นแหละ! เพลิดเพลินไปกับการพัฒนา!**
