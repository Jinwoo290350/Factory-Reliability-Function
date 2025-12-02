# Factory Reliability Function - Setup Guide

## สรุปการเปลี่ยนแปลง UI

### ✅ สิ่งที่แก้ไขแล้ว:

1. **ลบ "Manage Machine" ออกจาก Navbar**
   - ตอนนี้ navbar มีเฉพาะ "Failure Lists" และ "Component Lists"
   - หน้า Manage Machine จะไม่แสดงใน sidebar อีกต่อไป

2. **เพิ่มปุ่ม "Add Machine" ในหน้า Component Lists**
   - ปุ่มอยู่ถัดจากปุ่ม "Add Component"
   - เมื่อกดจะเปิดหน้า Manage Machine
   - มีปุ่ม Back กลับมาหน้า Component Lists ได้

3. **แก้ไขสี่เหลี่ยมสีน้ำเงินใน Navbar**
   - เปลี่ยนจากสี่เหลี่ยมสีน้ำเงินเป็นข้อความ "Factory System"
   - ดูสะอาดตาและเป็นมืออาชีพมากขึ้น

## Database และ Authentication

### Database Schema

โปรเจคนี้ใช้ **Prisma ORM** กับ **SQLite** (สามารถเปลี่ยนเป็น PostgreSQL ได้ง่าย)

#### Tables:
- **User** - เก็บข้อมูลผู้ใช้
- **Machine** - เก็บข้อมูลเครื่องจักร (ผูกกับ User)
- **Component** - เก็บข้อมูลจาก CSV (ผูกกับ User และ Machine)
- **CsvUpload** - ติดตามการอัพโหลด CSV
- **ReliabilityResult** - เก็บผลลัพธ์จากการวิเคราะห์

### CSV Format

ไฟล์ CSV ที่อัพโหลดต้องมี columns ดังนี้:

```csv
Machine,Component,SupComponent,Failure mode,Failure hours
Compressor-1,Motor,Bearing,Wear,8760
Compressor-1,Motor,Winding,Overheating,4380
Pump-2,Impeller,Blade,Crack,2190
```

## API Endpoints

### Authentication

#### 1. Register (สมัครสมาชิก)
```
POST /api/auth/register

Body:
{
  "email": "user@example.com",
  "password": "yourpassword",
  "username": "John Doe",
  "companyName": "ABC Factory" (optional)
}

Response:
{
  "message": "User created successfully",
  "user": {
    "id": "...",
    "email": "user@example.com",
    "username": "John Doe",
    "companyName": "ABC Factory",
    "createdAt": "..."
  }
}
```

#### 2. Login (เข้าสู่ระบบ)
```
POST /api/auth/login

Body:
{
  "email": "user@example.com",
  "password": "yourpassword"
}

Response:
{
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": "...",
    "email": "user@example.com",
    "username": "John Doe",
    "companyName": "ABC Factory"
  }
}
```

### CSV Upload

#### Upload CSV File
```
POST /api/csv/upload
Headers:
  Authorization: Bearer <jwt-token>

Body (multipart/form-data):
  file: <csv-file>

Response:
{
  "message": "CSV uploaded and processed successfully",
  "recordsProcessed": 25,
  "csvUploadId": "..."
}
```

## วิธีการติดตั้งและรัน

### 1. ติดตั้ง Dependencies

```bash
npm install
```

### 2. Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

### 3. Environment Variables

แก้ไขไฟล์ `.env`:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-change-this"
```

### 4. รัน Development Server

```bash
npm run dev
```

เปิดเบราว์เซอร์ที่ `http://localhost:3000`

## Database Management

### ดู Database ด้วย Prisma Studio

```bash
npx prisma studio
```

จะเปิดเว็บ UI สำหรับดูและจัดการข้อมูลในฐานข้อมูล

### Reset Database

```bash
npx prisma migrate reset
```

## ขั้นตอนต่อไป

### 1. Update Login Form
ต้องแก้ไข `components/login-form.tsx` เพื่อเชื่อมต่อกับ API จริง:
- เพิ่ม form สำหรับ register
- เรียก API `/api/auth/login`
- เก็บ JWT token ใน localStorage หรือ cookies
- ส่ง token ใน Authorization header สำหรับ API requests

### 2. Update Dashboard
แก้ไข `app/page.tsx` และ `components/dashboard.tsx`:
- โหลดข้อมูลจาก API แทนข้อมูล mock
- เพิ่มการจัดการ state ด้วย Context API หรือ Zustand
- เพิ่ม protected routes

### 3. Add CSV Upload UI
สร้าง component สำหรับอัพโหลด CSV:
- ปุ่มอัพโหลดในหน้า Component Lists
- แสดง progress และผลลัพธ์
- รองรับ drag & drop

### 4. Connect Python Backend
- Deploy Python notebook เป็น API บน GCP (Cloud Functions หรือ Cloud Run)
- สร้าง API endpoint สำหรับเรียกใช้การวิเคราะห์
- บันทึกผลลัพธ์ใน `ReliabilityResult` table

### 5. Production Deployment

#### Database
เปลี่ยนจาก SQLite เป็น PostgreSQL:
- แนะนำใช้ [Supabase](https://supabase.com) (ฟรี)
- หรือ [Neon](https://neon.tech) (serverless Postgres)

#### Frontend
Deploy บน Vercel (ง่ายที่สุด):
```bash
vercel deploy
```

## ไฟล์ที่สำคัญ

- `prisma/schema.prisma` - Database schema
- `lib/prisma.ts` - Prisma client instance
- `lib/auth.ts` - Authentication helpers
- `app/api/auth/` - Authentication API routes
- `app/api/csv/` - CSV upload API routes
- `DATABASE_SCHEMA.md` - เอกสาร database แบบละเอียด

## การแก้ปัญหา

### ถ้า Prisma generate ไม่ทำงาน
```bash
npx prisma generate --force
```

### ถ้า migration fail
```bash
npx prisma migrate reset
npx prisma migrate dev
```

### ถ้า JWT token ไม่ work
ตรวจสอบว่าตั้งค่า `JWT_SECRET` ใน `.env` แล้ว

## สรุป

ตอนนี้โปรเจคมี:
- ✅ UI ที่แก้ไขตามที่ขอแล้ว
- ✅ Database schema พร้อม Prisma
- ✅ Authentication API (register, login)
- ✅ CSV upload API
- ✅ เอกสารครบถ้วน

**ขั้นตอนต่อไปคือ:**
1. แก้ไข login form ให้เชื่อมต่อ API จริง
2. เพิ่ม CSV upload UI
3. เชื่อมต่อกับ Python backend API
4. Deploy production
