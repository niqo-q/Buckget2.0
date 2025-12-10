# 🪣 BuckGet - Your Financial Copilot

A modern fintech application for managing wages, savings buckets, and getting AI-powered financial advice.

![BuckGet](https://img.shields.io/badge/BuckGet-Fintech-blue)
![React](https://img.shields.io/badge/React-18-61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688)
![TiDB](https://img.shields.io/badge/TiDB-Serverless-4479A1)

## ✨ Features

- 💰 **Wage Management** - Track and unlock your available wages
- 🪣 **Savings Buckets** - Create and manage savings goals
- 🤖 **AI Financial Advisor** - Get personalized financial advice powered by Google Gemini
- 📊 **Transaction History** - Track all your financial activities
- 🔐 **Secure Authentication** - JWT-based authentication
- 📱 **Responsive Design** - Works on mobile, tablet, and desktop

## 🏗️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Radix UI** for accessible components

### Backend
- **FastAPI** (Python)
- **SQLAlchemy** ORM
- **TiDB Serverless** (MySQL compatible)
- **JWT** for authentication
- **Google Gemini** for AI features

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.10 or higher) - [Download](https://python.org/)
- **TiDB Cloud Account** - [Sign up free](https://tidbcloud.com/)
- **Google AI Studio API Key** (optional, for AI features) - [Get key](https://aistudio.google.com/apikey)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/buckget.git
cd buckget
```

### 2. Setup Backend

```bash
# Navigate to backend
cd Backend

# Install Python dependencies
pip install -r requirements.txt

# Copy environment template
copy env.template .env   # Windows
# cp env.template .env   # Mac/Linux

# Edit .env with your credentials (see Configuration section below)
```

### 3. Configure Environment Variables

Edit `Backend/.env` with your credentials:

```env
# TiDB Database (get from TiDB Cloud)
TIDB_HOST=your-host.tidbcloud.com
TIDB_PORT=4000
TIDB_USER=your-username
TIDB_PASSWORD=your-password
TIDB_DATABASE=buckget

# SSL Certificate (download from TiDB Cloud)
SSL_CA_PATH=cert/isrgrootx1.pem

# Google Gemini API (optional)
GEMINI_API_KEY=your-gemini-api-key

# JWT Secret (change in production!)
SECRET_KEY=your-super-secret-key
```

### 4. Setup Database

```bash
# Create database
python create_db.py

# Create tables and sample data
python setup_db.py
```

### 5. Start Backend Server

```bash
python -m uvicorn app.main:app --reload --port 8000
```

The API will be available at: http://localhost:8000
- API Docs: http://localhost:8000/docs

### 6. Setup Frontend

```bash
# Open new terminal, navigate to frontend
cd Frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at: http://localhost:5173

## 🔑 Default Login

After running `setup_db.py`, you can login with:

```
Email:    ahmad@buckget.com
Password: 123456
```

## 📁 Project Structure

```
BuckGet/
├── Backend/
│   ├── app/
│   │   ├── routers/        # API endpoints
│   │   ├── models.py       # Database models
│   │   ├── schemas.py      # Pydantic schemas
│   │   ├── auth.py         # JWT authentication
│   │   ├── config.py       # Configuration
│   │   └── database.py     # Database connection
│   ├── cert/               # SSL certificates (gitignored)
│   ├── .env                # Environment variables (gitignored)
│   ├── env.template        # Environment template
│   ├── requirements.txt    # Python dependencies
│   └── setup_db.py         # Database setup script
│
├── Frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── lib/            # API client & auth context
│   │   ├── assets/         # Images & fonts
│   │   └── App.tsx         # Main application
│   ├── package.json        # Node dependencies
│   └── vite.config.ts      # Vite configuration
│
└── README.md               # This file
```

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/users/me` | Get current user |
| GET | `/api/buckets` | Get all buckets |
| POST | `/api/buckets` | Create bucket |
| GET | `/api/transactions` | Get transactions |
| POST | `/api/ai-agent/query` | Chat with AI |

Full API documentation available at `/docs` when running the backend.

## 🛠️ Development

### Running Tests

```bash
# Backend
cd Backend
pytest

# Frontend
cd Frontend
npm test
```

### Building for Production

```bash
# Frontend
cd Frontend
npm run build
```

## 🔒 Security Notes

- Never commit `.env` files
- Keep SSL certificates in `Backend/cert/` (gitignored)
- Change `SECRET_KEY` in production
- Use strong passwords

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [TiDB Cloud](https://tidbcloud.com/) for the serverless database
- [Google AI](https://ai.google.dev/) for Gemini API
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [Tailwind CSS](https://tailwindcss.com/) for styling

---

Made with ❤️ for the Cursor Hackathon

