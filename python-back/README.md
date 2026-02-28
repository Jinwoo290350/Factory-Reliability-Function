# Factory Reliability API - Python Backend

FastAPI backend for Factory Reliability Function application.

**Production**: https://factory-reliability-function.onrender.com
**Frontend**: https://factory-reliability-function.vercel.app

## Stack

- **Runtime**: Python 3.11
- **Framework**: FastAPI + Uvicorn
- **Database**: PostgreSQL (Neon) via SQLAlchemy
- **Auth**: JWT (python-jose)
- **Hosting**: Render.com (free tier)

## Features

- Authentication: JWT-based login
- Machine Management: CRUD
- Component Management: CRUD
- CSV Upload: Bulk import
- Failure Items & Parameters: CRUD
- Machine Positions & Pictures: CRUD
- Reliability Analysis: Weibull, risk matrix

## Local Development

### 1. Clone and setup virtualenv

```bash
cd python-back
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in values:

```bash
cp .env.example .env
```

```env
# Use Neon PostgreSQL (production)
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require

# Or SQLite for quick local dev
# DATABASE_URL=sqlite:///./factory.db

JWT_SECRET=your-secret-key
ALLOWED_ORIGINS=http://localhost:3000
```

### 3. Run

```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

API: http://localhost:8000
Docs: http://localhost:8000/docs

## Deployment (Render.com)

### Environment Variables (set in Render Dashboard)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `ALLOWED_ORIGINS` | Frontend URL (Vercel) |
| `PYTHON_VERSION` | `3.11.11` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `10080` (7 days) |

### Migrate data from SQLite to PostgreSQL

```bash
cd python-back
# Set DATABASE_URL to Neon URL in .env first
python3 migrate_sqlite_to_postgres.py
```

### Create admin user

```bash
cd python-back
source venv/bin/activate
python3 create_user.py
```

## API Endpoints

### Auth
- `POST /auth/register` - Register
- `POST /auth/login` - Login → returns JWT token

### Machines
- `GET /machines` - List all
- `POST /machines` - Create
- `GET /machines/{id}` - Get by ID
- `PUT /machines/{id}` - Update
- `DELETE /machines/{id}` - Delete

### Components
- `GET /components` - List all (filter: `?machine_id=`)
- `POST /components` - Create
- `GET /components/{id}` - Get by ID
- `PUT /components/{id}` - Update
- `DELETE /components/{id}` - Delete

### Failure Items
- `GET /failure-items` - List
- `POST /failure-items` - Create
- `PUT /failure-items/{id}` - Update
- `DELETE /failure-items/{id}` - Delete

### CSV Upload
- `POST /csv/upload` - Upload CSV file

**CSV Format:**
```csv
Machine,Component,SupComponent,Failure mode,Failure hours
Compressor-1,Motor,Bearing,Wear,8760
```

### Machine Positions & Pictures
- `GET /machine-positions` - List
- `POST /machine-positions` - Create
- `GET /machine-pictures` - List
- `POST /machine-pictures` - Upload

## Authentication

All endpoints except `/auth/register` and `/auth/login` require JWT token:

```
Authorization: Bearer <your-token>
```

## Project Structure

```
python-back/
├── app.py                      # FastAPI app entry point
├── requirements.txt            # Dependencies
├── Procfile                    # Render start command
├── runtime.txt                 # Python 3.11.11
├── render.yaml                 # Render config
├── .env.example                # Env var template
├── migrate_sqlite_to_postgres.py  # Migration script
├── create_user.py              # Create admin user
├── models/
│   ├── database.py             # SQLAlchemy ORM models
│   └── schemas.py              # Pydantic schemas
├── routes/
│   ├── auth.py
│   ├── machines.py
│   ├── components.py
│   ├── failure_items.py
│   ├── csv_upload.py
│   ├── machine_positions.py
│   └── machine_pictures.py
├── services/
│   ├── auth_service.py
│   └── csv_processor.py
└── utils/
    ├── auth.py                 # JWT utilities
    └── database.py             # DB connection (SQLite/PostgreSQL)
```

## Troubleshooting

**App sleeps after 15 min inactivity (Render free tier)**
- First request after sleep takes ~30 seconds (cold start)
- Normal behavior on free tier

**CORS error**
- Check `ALLOWED_ORIGINS` in Render dashboard includes your Vercel URL
- Format: `https://your-app.vercel.app` (no trailing slash)

**Database connection error**
- Verify `DATABASE_URL` in Render dashboard is the Neon PostgreSQL URL
- Must start with `postgresql://` not `sqlite:///`
