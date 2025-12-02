# Factory Reliability API - Python Backend

FastAPI backend for Factory Reliability Function application.

## Features

- **Authentication**: JWT-based user registration and login
- **Machine Management**: CRUD operations for machines
- **Component Management**: CRUD operations for components
- **CSV Upload**: Bulk import machines and components from CSV files
- **Reliability Analysis**: Weibull analysis, risk matrix, time-to-failure predictions (coming soon)

## Setup Instructions

### 1. Install Python Dependencies

```bash
cd python-back
pip install -r requirements.txt
```

Or using virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Setup PostgreSQL Database

Using Docker (recommended):

```bash
docker run --name factory-postgres \
  -e POSTGRES_USER=factory \
  -e POSTGRES_PASSWORD=devpassword \
  -e POSTGRES_DB=factory_db \
  -p 5432:5432 \
  -d postgres:15
```

Or install PostgreSQL locally and create database:

```sql
CREATE DATABASE factory_db;
CREATE USER factory WITH PASSWORD 'devpassword';
GRANT ALL PRIVILEGES ON DATABASE factory_db TO factory;
```

### 3. Configure Environment Variables

The `.env` file is already created. Update if needed:

```env
DATABASE_URL=postgresql://factory:devpassword@localhost:5432/factory_db
JWT_SECRET=your-secret-key-change-this-in-production
UPLOAD_DIR=./uploads
```

### 4. Run the Server

```bash
python app.py
```

Or using uvicorn directly:

```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token

### Machines

- `GET /machines` - Get all machines
- `POST /machines` - Create new machine
- `GET /machines/{id}` - Get machine by ID
- `PUT /machines/{id}` - Update machine
- `DELETE /machines/{id}` - Delete machine

### Components

- `GET /components` - Get all components (optional `?machine_id=`)
- `POST /components` - Create new component
- `GET /components/{id}` - Get component by ID
- `PUT /components/{id}` - Update component
- `DELETE /components/{id}` - Delete component

### CSV Upload

- `POST /csv/upload` - Upload and process CSV file

**CSV Format:**
```csv
Machine,Component,SupComponent,Failure mode,Failure hours
Compressor-1,Motor,Bearing,Wear,8760
Compressor-1,Motor,Winding,Overheating,4380
```

### Reliability Analysis (Coming Soon)

- `POST /reliability/weibull` - Weibull analysis
- `POST /reliability/risk-matrix` - Risk matrix calculation
- `POST /reliability/time-to-failure` - Time to failure prediction

## Database Schema

The API uses PostgreSQL with SQLAlchemy ORM. Tables are automatically created on first run:

- **users** - User accounts
- **machines** - Factory machines
- **components** - Machine components
- **csv_uploads** - CSV upload tracking
- **reliability_results** - Analysis results storage

## Authentication

All endpoints except `/auth/register` and `/auth/login` require authentication.

Include JWT token in Authorization header:

```
Authorization: Bearer <your-token>
```

## Testing

Test the API using the interactive docs at http://localhost:8000/docs

Or using curl:

```bash
# Register
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","username":"Test User"}'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get machines (with token)
curl http://localhost:8000/machines \
  -H "Authorization: Bearer <your-token>"
```

## Project Structure

```
python-back/
├── app.py                 # Main FastAPI application
├── requirements.txt       # Python dependencies
├── .env                  # Environment variables
├── models/
│   ├── database.py       # SQLAlchemy models
│   └── schemas.py        # Pydantic schemas
├── routes/
│   ├── auth.py           # Authentication endpoints
│   ├── csv_upload.py     # CSV upload
│   ├── machines.py       # Machine CRUD
│   └── components.py     # Component CRUD
├── services/
│   ├── auth_service.py   # Authentication logic
│   └── csv_processor.py  # CSV processing
├── utils/
│   ├── auth.py           # JWT utilities
│   └── database.py       # Database connection
└── uploads/              # User file storage
```

## Next Steps

1. Extract reliability calculation functions from System_reliability.ipynb
2. Implement Weibull analysis endpoint
3. Implement risk matrix endpoint
4. Add unit tests
5. Deploy to GCP Cloud Run

## Troubleshooting

### Database connection error

Make sure PostgreSQL is running:

```bash
docker ps  # Check if container is running
docker logs factory-postgres  # Check logs
```

### Import errors

Make sure you're in the python-back directory and dependencies are installed:

```bash
cd python-back
pip install -r requirements.txt
```

### Port already in use

Change the PORT in `.env` or stop the conflicting service:

```bash
lsof -i :8000  # Find process using port 8000
kill -9 <PID>  # Kill the process
```
