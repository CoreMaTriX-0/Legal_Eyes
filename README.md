# Legal Eyes 👁️⚖️

> **AI-powered legal document analysis platform** — upload your contracts, NDAs, or any legal document and let Ollama (Qwen) summarize, simplify, flag risks, and answer your questions about it.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Features](#features)
- [Contribution Guidelines](#contribution-guidelines)

---

## Overview

Legal Eyes is a full-stack web application that helps users understand complex legal documents without needing a lawyer. Users can:

1. **Register / Log in** securely with JWT authentication.
2. **Upload** a legal document (PDF, DOCX, or TXT).
3. **Interact** with the document through an AI chat interface powered by **Ollama + Qwen 7B**.
4. Get an instant **summary**, **plain-language simplification**, **risk identification**, and **Q&A** answers derived directly from the document.

---

## Architecture

```
Legal_Eyes/
├── backend/          # Django REST API (Python)
│   └── eyes/
│       ├── userauth/    # JWT-based authentication (register, login, refresh)
│       ├── docsapp/     # Document management + Ollama AI features
│       └── eyes/        # Django project settings & root URLs
├── frontend/         # React SPA (JavaScript)
│   └── src/
│       ├── components/  # Auth UI components
│       ├── pages/       # Landing, Login, Register, Chat pages
│       └── utils/       # API client & validators
└── mobile/           # Mobile app (coming soon — Farhan's area 🚧)
```

---

## Tech Stack

| Layer       | Technology                                      |
|-------------|-------------------------------------------------|
| Backend     | Python 3, Django 5, Django REST Framework       |
| Auth        | JWT via `djangorestframework-simplejwt`         |
| AI Engine   | Ollama (local REST API) + Qwen 7B              |
| Doc Parsing | PyPDF2 (PDF), python-docx (DOCX), built-in (TXT)|
| Frontend    | React 18, React Router v6, Lucide React icons   |
| Database    | SQLite (dev) — swap for PostgreSQL in production|

---

## Project Structure

### Backend — `backend/eyes/`

```
eyes/
├── userauth/
│   ├── views.py        # RegisterView
│   ├── serializers.py  # User registration serializer
│   └── urls.py         # /api/auth/register/, /api/auth/login/, /api/auth/refresh/
├── docsapp/
│   ├── models.py       # LegalDocument model
│   ├── services.py     # Text extraction (PDF / DOCX / TXT)
│   ├── ai_service.py   # OllamaService wrapper (summarize, simplify, risks, Q&A)
│   ├── serializers.py  # Document serializers
│   ├── views.py        # All document & AI API views
│   └── urls.py         # Document & AI endpoint routes
└── eyes/
    ├── settings.py     # Django settings
    └── urls.py         # Root URL router
```

### Frontend — `frontend/src/`

```
src/
├── components/Auth/    # AuthLayout, LoginForm, RegisterForm, Auth.css
├── pages/
│   ├── index.jsx       # Landing page (logo + navigation buttons)
│   ├── LoginPage.jsx   # Login page
│   ├── RegisterPage.jsx# Registration page
│   └── ChatPage.jsx    # AI document chat interface
├── utils/
│   ├── authApi.js      # API client (login, register, token management)
│   └── validators.js   # Form validation (email, password, username)
└── App.jsx             # Router with protected + public route guards
```

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+ & npm
- Ollama installed locally with a pulled model (for example: `qwen2.5:7b`)

---

### Backend Setup

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirement.txt

# 4. Create a .env file (see Environment Variables section)

# 5. Run database migrations
cd eyes
python manage.py migrate

# 6. Start the development server
python manage.py runserver
```

The backend API will be available at **http://localhost:8000**.

---

### Frontend Setup

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start the development server
npm start
```

The React app will be available at **http://localhost:3000**.

---

## Environment Variables

Create a `.env` file inside `backend/eyes/` with the following:

```env
# Django secret key — change this in production
SECRET_KEY=your-very-secret-django-key

# Set to False in production
DEBUG=True

# Required for AI features
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5:7b
OLLAMA_TIMEOUT=60
```

For the frontend, create a `.env` file inside `frontend/` if you need to override the API URL:

```env
REACT_APP_API_URL=http://localhost:8000
```

---

## API Reference

### Auth Endpoints — `/api/auth/`

| Method | Endpoint       | Description                      | Auth Required |
|--------|----------------|----------------------------------|---------------|
| POST   | `register/`    | Create a new user account        | No            |
| POST   | `login/`       | Obtain JWT access + refresh token| No            |
| POST   | `refresh/`     | Refresh access token             | No            |

### Document Endpoints — `/api/documents/`

| Method | Endpoint              | Description                              | Auth Required |
|--------|-----------------------|------------------------------------------|---------------|
| GET    | `/`                   | List all documents owned by the user     | Yes           |
| POST   | `upload/`             | Upload a new document (PDF/DOCX/TXT)     | Yes           |
| GET    | `<id>/`               | Retrieve a specific document             | Yes           |
| DELETE | `<id>/`               | Delete a specific document               | Yes           |

### AI Feature Endpoints — `/api/documents/<id>/`

| Method | Endpoint      | Description                              | Auth Required |
|--------|---------------|------------------------------------------|---------------|
| POST   | `summary/`    | Generate a plain-English summary         | Yes           |
| POST   | `simplify/`   | Rewrite the document in simple language  | Yes           |
| POST   | `risks/`      | Identify risky or unfavorable clauses    | Yes           |
| POST   | `qa/`         | Answer a specific question about the doc | Yes           |

### Dev/Test Endpoints — `/api/documents/test/`

| Method | Endpoint       | Description                              |
|--------|----------------|------------------------------------------|
| GET    | `ollama/`      | Verify local Ollama API connection       |
| POST   | `extract/`     | Test text extraction without saving      |
| POST   | `ai/`          | Test AI analysis with raw text           |
| POST   | `qa/`          | Test Q&A with raw text + question        |

---

## Features

### ✅ Implemented

- [x] User registration and login with JWT
- [x] Protected and public route handling in the React SPA
- [x] Document upload with automatic text extraction (PDF, DOCX, TXT)
- [x] AI-powered document summarization
- [x] AI-powered clause simplification
- [x] AI-powered risk identification
- [x] AI-powered Q&A on document content
- [x] Chat interface for interacting with uploaded documents
- [x] Landing page with logo and navigation
- [x] Test endpoints for rapid backend development

### 🚧 Planned / In Progress

- [ ] Document library / My Documents page
- [ ] Mobile application (React Native — `mobile/` directory)
- [ ] Production deployment configuration
- [ ] Async document processing with Celery
- [ ] Multi-document chat sessions
- [ ] PostgreSQL support for production

---

## Contribution Guidelines

1. **Always update `requirement.txt`** (backend) or `package.json` (frontend) when adding new dependencies.
2. **Commit messages** should describe: *what changed*, *why it was changed*, and any *new imports / libraries* used.
3. Backend changes must include the relevant app folder's readme note explaining the change.
4. Frontend changes should be reflected in `frontend/readme.md`.
5. Keep AI prompts inside `ai_service.py` — do not scatter them across views.
6. The `mobile/` directory is Farhan's area — coordinate before making changes there.

---

## License

This project is private. All rights reserved.
