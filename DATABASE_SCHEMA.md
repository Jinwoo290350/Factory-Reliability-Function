# Database Schema Design

## Overview
This document outlines the database schema for the Factory Reliability Function application.

## Tables

### 1. Users Table
Stores user authentication and profile information.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(100) NOT NULL,
  company_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Machines Table
Stores machine information linked to users.

```sql
CREATE TABLE machines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sequence INTEGER,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Components Table
Stores component information from CSV uploads.

```sql
CREATE TABLE components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  machine_id UUID REFERENCES machines(id) ON DELETE SET NULL,
  machine_name VARCHAR(255) NOT NULL,
  component_name VARCHAR(255) NOT NULL,
  sub_component VARCHAR(255),
  failure_mode VARCHAR(255),
  failure_hours DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. CSV_Uploads Table
Tracks CSV file uploads and their processing status.

```sql
CREATE TABLE csv_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  file_size INTEGER,
  records_count INTEGER,
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP
);
```

### 5. Reliability_Results Table
Stores computed reliability analysis results from Python API.

```sql
CREATE TABLE reliability_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  component_id UUID REFERENCES components(id) ON DELETE CASCADE,
  analysis_type VARCHAR(100), -- weibull, risk_matrix, etc.
  results JSONB NOT NULL, -- Store flexible JSON results
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Indexes

```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);

-- Machine lookups
CREATE INDEX idx_machines_user_id ON machines(user_id);
CREATE INDEX idx_machines_created_at ON machines(created_at);

-- Component lookups
CREATE INDEX idx_components_user_id ON components(user_id);
CREATE INDEX idx_components_machine_id ON components(machine_id);
CREATE INDEX idx_components_machine_name ON components(machine_name);

-- CSV upload lookups
CREATE INDEX idx_csv_uploads_user_id ON csv_uploads(user_id);
CREATE INDEX idx_csv_uploads_status ON csv_uploads(status);

-- Reliability results lookups
CREATE INDEX idx_reliability_results_user_id ON reliability_results(user_id);
CREATE INDEX idx_reliability_results_component_id ON reliability_results(component_id);
```

## CSV Format

The CSV file should have the following columns:
- **Machine**: Machine name
- **Component**: Component name
- **SupComponent**: Sub-component name (optional)
- **Failure mode**: Failure mode description
- **Failure hours**: Hours to failure (numeric)

### Example CSV:
```csv
Machine,Component,SupComponent,Failure mode,Failure hours
Compressor-1,Motor,Bearing,Wear,8760
Compressor-1,Motor,Winding,Overheating,4380
Pump-2,Impeller,Blade,Crack,2190
```

## Technology Stack Recommendations

### Option 1: PostgreSQL (Recommended for Production)
- Full-featured relational database
- Excellent JSON support (JSONB)
- Scalable and reliable
- Good for complex queries

### Option 2: SQLite (Quick Start / Development)
- Serverless, file-based
- No setup required
- Good for prototyping
- Easy to migrate to PostgreSQL later

### Option 3: Supabase (Easiest Setup)
- PostgreSQL-based
- Built-in authentication
- Real-time subscriptions
- Free tier available
- REST and GraphQL APIs auto-generated

## Next Steps

1. Choose database technology (recommend: Supabase for quick start)
2. Set up database connection
3. Create migration scripts
4. Implement ORM models (Prisma recommended)
5. Build authentication API
6. Implement CSV upload endpoint
7. Connect to Python reliability analysis API
