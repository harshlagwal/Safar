# Safar Backend API

REST API for **Safar** — an AI-powered Indian travel planner with JWT authentication.

Built with **Node.js 20**, **Express (ESM)**, **MongoDB + Mongoose**, **Google Gemini** (`@google/genai`), **Bcrypt**, **JsonWebToken**, and **Zod**.

---

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Populate `.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/safar?retryWrites=true&w=majority
GEMINI_API_KEY=AIzaSy...
JWT_SECRET=9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Run Test Suite
```bash
npm test
```

---

## 📡 API Endpoints

### 🔐 Authentication
| Method | Endpoint | Description | Rate Limit | Auth |
|---|---|---|---|---|
| `POST` | `/api/auth/signup` | Create account & receive JWT | 10 req / hr / IP | None |
| `POST` | `/api/auth/login` | Log in with email & password | 10 req / hr / IP | None |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | 100 req / hr / IP | `Bearer <token>` |

### 🗺️ Trips & Planning
| Method | Endpoint | Description | Rate Limit | Auth |
|---|---|---|---|---|
| `GET` | `/api/health` | Healthcheck & MongoDB status | None | None |
| `POST` | `/api/plan` | Generate & persist a trip plan | 20 req / hr / IP | Optional (attaches userId if token provided) |
| `GET` | `/api/trips` | List logged-in user's trips (summary) | 100 req / hr / IP | `Bearer <token>` |
| `GET` | `/api/trips/:id` | Fetch full saved trip by ID | 100 req / hr / IP | Optional (checks ownership if trip is private) |
| `POST` | `/api/trips/:id/regenerate` | Re-generate plan using stored form | 20 req / hr / IP | Optional (checks ownership) |
| `GET` | `/api/share/:shareId` | Read-only trip fetch by shareId | 100 req / hr / IP | None |

---

## 🛡️ Error Contract

All error responses follow this exact contract:
```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```
Available error codes:
- `VALIDATION_FAILED` (400)
- `INVALID_CREDENTIALS` (401)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `EMAIL_TAKEN` (409)
- `RATE_LIMITED` (429)
- `AI_BAD_OUTPUT` (502)
- `AI_TIMEOUT` (504)
- `SERVER_ERROR` (500)
