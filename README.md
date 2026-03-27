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
2. **Upload** a legal document (PDF, DOCX, or TXT) and track progress with real-time feedback.
3. **Interact** with the document through an AI chat interface powered by **Ollama + Qwen 7B**.
4. Get an instant **summary**, **plain-language simplification**, **risk identification**, and **Q&A** answers derived directly from the document.
5. Manage tracking with a built-in **History Page** and **My Documents** library.

The application features a modern, premium **dark-themed, ChatGPT/Gemini-inspired UI** built strictly with React and vanilla CSS for optimal performance and aesthetics.

---

## Architecture

```
Legal_Eyes/
├── backend/                    # Django REST API (Python)
│   └── eyes/
│       ├── userauth/           # JWT authentication (register, login, token refresh)
│       ├── docsapp/            # Document management + AI analysis
│       └── eyes/               # Django settings & root URL routing
├── frontend/                   # React SPA (JavaScript/React 18)
│   └── src/
│       ├── components/         # Auth UI, Sidebar navigation
│       ├── pages/              # Landing, Login, Chat, History, Documents
│       ├── utils/              # API client, validators, chat persistence
│       └── styles/             # Global CSS with dark theme
└── mobile/                     # Mobile app (React Native — coming soon)
```

---

## Tech Stack

| Layer           | Technology                                    |
|-----------------|-----------------------------------------------||
| **Backend**     | Python 3.10+, Django 5, Django REST Framework|
| **Auth**        | JWT via `djangorestframework-simplejwt`       |
| **AI Engine**   | Ollama (local API) + Qwen 2.5 / 7B           |
| **Doc Parsing** | PyPDF2, python-docx, built-in TXT            |
| **Frontend**    | React 18, React Router v6, Lucide Icons      |
| **Database**    | SQLite (dev) → PostgreSQL (production)       |
| **Streaming**   | Django StreamingHttpResponse for real-time AI|

---

## Project Structure

### Backend — `backend/eyes/`

```
eyes/
├── userauth/
│   ├── views.py             # RegisterView, CustomTokenObtainPairView
│   ├── serializers.py       # User registration + JWT serializer
│   ├── models.py            # (extends Django User model)
│   └── urls.py              # POST /register/, /login/, /refresh/
├── docsapp/
│   ├── models.py            # LegalDocument (user, file, extracted_text, status)
│   ├── services.py          # extract_text_from_file() for PDF/DOCX/TXT
│   ├── ai_service.py        # OllamaService (summarize, simplify, risks, Q&A, streaming)
│   ├── serializers.py       # LegalDocumentSerializer, DocumentUploadSerializer
│   ├── views.py             # Document CRUD + AI endpoints + test APIs
│   ├── urls.py              # Routes for upload, summary, simplify, risks, qa, tests
│   └── migrations/
└── eyes/ (project)
    ├── settings.py          # INSTALLED_APPS, MIDDLEWARE, DATABASES, CORS
    ├── urls.py              # Root router (/api/auth/, /api/docs/)
    ├── asgi.py              # ASGI config for deployment
    └── wsgi.py              # WSGI config for deployment
```

### Frontend — `frontend/src/`

```
src/
├── components/
│   ├── Auth/
│   │   ├── AuthLayout.jsx       # Wrapper for login/register pages
│   │   ├── LoginForm.jsx        # Login form with validation
│   │   ├── RegisterForm.jsx     # Registration form with password confirm
│   │   ├── Auth.css             # GitHub-inspired auth styling
│   │   └── index.js             # Component exports
│   └── Sidebar/
│       ├── Sidebar.jsx          # Navigation menu with links
│       └── Sidebar.css          # Sidebar styling
├── pages/
│   ├── index.jsx                # Landing with particle background
│   ├── LoginPage.jsx            # Login entry point
│   ├── RegisterPage.jsx         # Registration entry point
│   ├── ChatPage.jsx             # Document upload + AI chat interface
│   ├── HistoryPage.jsx          # Search and manage past conversations
│   ├── DocumentsPage.jsx        # Document library with status and actions
│   ├── ChatPage.css
│   ├── HistoryPage.css
│   └── DocumentsPage.css
├── utils/
│   ├── authApi.js               # API calls (login, register, getDocuments, deleteDocument)
│   ├── validators.js            # Email, password, username validation
│   └── chatHistory.js           # localStorage chat persistence (save/retrieve/delete)
├── styles/
│   └── global.css               # CSS variables, dark theme, animations
├── App.jsx                      # Router with ProtectedRoute / PublicRoute guards
└── index.js                     # React entry point
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

| Method | Endpoint       | Body | Description                          | Auth |
|--------|----------------|------|--------------------------------------|------|
| POST   | `register/`    | `{email, username, password}` | Create new user account    | No   |
| POST   | `login/`       | `{username, password}` | Get JWT access + refresh tokens | No   |
| POST   | `refresh/`     | `{refresh}` | Refresh expired access token | No   |

### Document Endpoints — `/api/docs/`

| Method | Endpoint              | Description                          | Auth |
|--------|----------------------|--------------------------------------|------|
| GET    | `/`                  | List user's documents                | Yes  |
| POST   | `upload/`            | Upload PDF/DOCX/TXT (multipart form)| Yes  |
| GET    | `<id>/`              | Get document details & extracted text| Yes  |
| DELETE | `<id>/`              | Delete document                      | Yes  |

### AI Analysis Endpoints — `/api/docs/<id>/`

| Method | Endpoint      | Body | Description                                  | Auth |
|--------|---------------|------|----------------------------------------------|------|
| POST   | `summary/`    | `{}` | Generate document summary                    | Yes  |
| POST   | `simplify/`   | `{}` | Simplify legal language                      | Yes  |
| POST   | `risks/`      | `{}` | Identify risky/unfavorable clauses           | Yes  |
| POST   | `qa/`         | `{question}` | Answer question about document              | Yes  |

**Note:** All AI endpoints support streaming responses for real-time output in the frontend.

### Test/Development Endpoints — `/api/docs/test/`

| Method | Endpoint       | Description                              |
|--------|----------------|------------------------------------------|
| GET    | `ollama/`      | Check Ollama API connection (no auth req)|
| POST   | `extract/`     | Test file extraction without saving     |
| POST   | `ai/`          | Test AI analysis with raw text          |
| POST   | `qa/`          | Test Q&A with raw text + question       |

---

## Features

### ✅ Implemented

- [x] **User Authentication** — Secure registration and login with JWT tokens
- [x] **Protected Routes** — Public (login, register) and protected (chat, docs, history) routes
- [x] **Multi-Format Upload** — PDF, DOCX, and TXT document support with automatic text extraction
- [x] **Real-Time Streaming** — AI responses stream token-by-token for better UX
- [x] **Document Summarization** — Generate concise summaries of legal documents
- [x] **Legal Language Simplification** — Convert complex legal terms to plain English
- [x] **Risk Identification** — Highlight unfavorable clauses and potential concerns
- [x] **Document Q&A** — Ask targeted questions and get answers based on document content
- [x] **Chat History** — Persistent storage and retrieval of past conversations (localStorage)
- [x] **Document Library** — View, download, and delete uploaded documents with status tracking
- [x] **Upload Progress** — Real-time visual feedback during file upload (progress ring)
- [x] **Cancel Generation** — Stop active AI analysis using AbortController
- [x] **Dark Theme UI** — Modern, ChatGPT/Gemini-inspired dark interface with animations
- [x] **Search History** — Find past chats by title, document name, or message content
- [x] **Responsive Design** — Mobile-friendly frontend with Sidebar navigation

### 🚧 Planned / In Progress

- [ ] **Mobile App** — React Native application (separate repository — `mobile/` directory)
- [ ] **Production Deployment** — Docker, nginx, SSL, and environment hardening
- [ ] **Async Processing** — Celery workers for background document extraction and AI analysis
- [ ] **Multi-Document Sessions** — Analyze and compare multiple documents in one chat
- [ ] **Clause Comparison** — Side-by-side comparison of contract clauses
- [ ] **Compliance Checklists** — Template-based compliance verification
- [ ] **Collaborative Review** — Team workspaces and comment threads
- [ ] **PostgreSQL Migration** — Production-grade database with connection pooling
- [ ] **Custom AI Models** — Fine-tuned legal domain models
- [ ] **API Rate Limiting** — Prevent abuse and manage server load
- [ ] **Export to PDF** — Download chat transcripts and analysis reports
- [ ] **Email Notifications** — Alerts for document processing completion

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
