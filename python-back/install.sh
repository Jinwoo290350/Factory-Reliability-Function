#!/bin/bash

echo "Installing Python dependencies for Factory Reliability API..."

# Core FastAPI
python3 -m pip install fastapi==0.109.0
python3 -m pip install "uvicorn[standard]==0.27.0"
python3 -m pip install python-multipart==0.0.6

# Database
python3 -m pip install sqlalchemy==2.0.25
python3 -m pip install alembic==1.13.1

# Authentication
python3 -m pip install "python-jose[cryptography]==3.3.0"
python3 -m pip install "passlib[bcrypt]==1.7.4"

# Utilities
python3 -m pip install python-dotenv==1.0.0

echo "✓ Core dependencies installed!"
echo ""
echo "Note: pandas, numpy, scipy are not installed yet (for reliability calculations)"
echo "They will be needed later for Weibull analysis."
echo ""
echo "To start the server: python3 app.py"
