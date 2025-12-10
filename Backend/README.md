# BuckGet Backend API

FastAPI backend for the BuckGet fintech application.

## Tech Stack

- **Framework**: FastAPI (Python 3.11+)
- **Database**: TiDB Serverless (MySQL-compatible)
- **ORM**: SQLAlchemy 2.0
- **Authentication**: JWT (python-jose)
- **AI**: OpenAI GPT-3.5/4

## Quick Start

### 1. Install Dependencies

```bash
cd Backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Configure Environment

Create a `.env` file in the Backend directory:

```env
# Application
APP_NAME=BuckGet API
DEBUG=true
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# TiDB Database
TIDB_HOST=gateway01.us-west-2.prod.aws.tidbcloud.com
TIDB_PORT=4000
TIDB_USER=your-username
TIDB_PASSWORD=your-password
TIDB_DATABASE=buckget

# For local MySQL development
# DATABASE_URL=mysql+pymysql://root:password@localhost:3306/buckget

# OpenAI (optional - for AI Agent)
OPENAI_API_KEY=sk-your-key

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 3. Run the Server

```bash
# Development mode with auto-reload
uvicorn app.main:app --reload --port 8000

# Or directly
python -m app.main
```

### 4. Access the API

- **API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## API Endpoints

### Authentication
```
POST /api/auth/register   - Register new user
POST /api/auth/login      - Login (form data)
POST /api/auth/login/json - Login (JSON body)
GET  /api/auth/me         - Get current user
POST /api/auth/refresh    - Refresh token
```

### Users
```
GET    /api/users         - List users
GET    /api/users/{id}    - Get user
POST   /api/users         - Create user
PUT    /api/users/{id}    - Update user
DELETE /api/users/{id}    - Delete user
```

### Buckets (Savings Goals)
```
GET    /api/buckets       - List buckets
GET    /api/buckets/{id}  - Get bucket
POST   /api/buckets       - Create bucket
PUT    /api/buckets/{id}  - Update bucket
DELETE /api/buckets/{id}  - Delete bucket
POST   /api/buckets/{id}/add-money - Add money to bucket
```

### Transactions
```
GET    /api/transactions       - List transactions
GET    /api/transactions/{id}  - Get transaction
POST   /api/transactions       - Create transaction
POST   /api/transactions/split - Split funds (Buck Up!)
POST   /api/transactions/add-wages - Add wages
```

### Roles (RBAC)
```
GET    /api/roles         - List roles
GET    /api/roles/{id}    - Get role
POST   /api/roles         - Create role
PUT    /api/roles/{id}    - Update role
DELETE /api/roles/{id}    - Delete role
```

### Settings
```
GET    /api/settings      - Get user settings
PUT    /api/settings      - Update settings
```

### AI Agent
```
POST   /api/ai-agent/query   - Query AI agent
GET    /api/ai-agent/history - Get chat history
```

## Database Schema

See `FRONTEND_AUDIT_REPORT.md` for full database schema.

## Project Structure

```
Backend/
├── app/
│   ├── __init__.py
│   ├── main.py           # FastAPI application
│   ├── config.py         # Settings
│   ├── database.py       # Database connection
│   ├── models.py         # SQLAlchemy models
│   ├── schemas.py        # Pydantic schemas
│   ├── auth.py           # Authentication
│   └── routers/
│       ├── __init__.py
│       ├── auth.py
│       ├── users.py
│       ├── buckets.py
│       ├── transactions.py
│       ├── roles.py
│       ├── settings.py
│       └── ai_agent.py
├── requirements.txt
└── README.md
```

## TiDB Setup

1. Go to [TiDB Cloud](https://tidbcloud.com/)
2. Create a Serverless cluster
3. Get connection details from the console
4. Update your `.env` file

## Development

### Run Tests
```bash
pytest
```

### Format Code
```bash
black app/
isort app/
```

### Type Checking
```bash
mypy app/
```

## License

MIT License - BuckGet 2024

