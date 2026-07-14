# 🤖 Agent Customization Guide

This document helps AI coding agents understand the **Information Aggregator & Search Platform** project structure, conventions, and best practices.

---

## 📚 Project Overview

**Information Aggregator & Search Platform** is a full-stack web application designed to:
- Search and discover information from multiple sources
- Aggregate and summarize documents across multiple sources
- Provide a modern, user-friendly interface for data discovery

**Tech Stack:**
- **Frontend**: React.js / Vue.js / Next.js + Tailwind CSS
- **Backend**: Node.js (Express.js) / Python (FastAPI)
- **Database**: SQLite / MongoDB / PostgreSQL (Local)
- **Search**: Meilisearch / Algolia
- **Integrations**: Web APIs, Web Scraping, NLP/AI

---

## 🏗️ Project Structure

```
project/
├── frontend/                  # React/Vue web UI
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API service calls
│   │   ├── hooks/             # Custom React hooks
│   │   ├── styles/            # CSS/Tailwind styles
│   │   └── App.jsx
│   ├── public/
│   └── package.json
│
├── backend/                   # Express/FastAPI server
│   ├── src/
│   │   ├── routes/            # API route definitions
│   │   ├── controllers/       # Business logic
│   │   ├── models/            # Database models
│   │   ├── services/          # Service layer
│   │   ├── middleware/        # Express middleware
│   │   ├── config/            # Configuration
│   │   └── app.js / main.py
│   ├── .env.example
│   └── package.json / requirements.txt
│
├── database/                  # DB setup & migrations
│   ├── migrations/            # Schema migrations
│   └── seeds/                 # Sample data
│
├── docker-compose.yml
├── README.md
└── AGENTS.md (this file)
```

---

## 🔑 Key Conventions & Patterns

### 1. **API Design**
- **RESTful endpoints** for backend APIs
- Search API: `GET /api/search?q=keyword&filters=...`
- Document API: `GET /api/documents/:id`, `GET /api/documents/:id/summary`
- Collections API: CRUD operations for user collections
- Source API: Manage data sources

### 2. **Frontend Architecture**
- **Component-based**: Reusable, single-responsibility components
- **Services layer**: Axios/Fetch for API calls (separate from components)
- **State Management**: Redux/Zustand for global state
- **Styling**: Tailwind CSS (utility-first approach)
- **Responsive**: Mobile-first design

### 3. **Backend Architecture**
- **MVC Pattern**: Models, Controllers, Services
- **Route handlers**: Express route definitions in `routes/`
- **Business logic**: Service layer in `services/`
- **Database abstraction**: Models in `models/`
- **Middleware**: Authentication, logging, error handling

### 4. **Database**
- **Local database first**: SQLite (default), MongoDB, or PostgreSQL
- **Migrations**: Version-controlled schema changes
- **Seeds**: Sample data for development
- **Environment-based**: Different DB for dev/test/prod

---

## 🚀 Common Development Tasks

### Setup & Installation
```bash
# Frontend
cd frontend
npm install
cp .env.example .env.local
npm run dev

# Backend
cd backend
npm install
cp .env.example .env
npm run migrate:local
npm run dev

# Database (choose one)
npm run init-local-db        # SQLite (recommended)
npm run migrate:mongo        # MongoDB
npm run migrate:postgres     # PostgreSQL
```

### Running Tests
```bash
# Frontend tests
cd frontend
npm run test
npm run test:e2e

# Backend tests
cd backend
npm run test
npm run test:integration
```

### Build & Deployment
```bash
# Frontend build
cd frontend
npm run build

# Backend build/start
cd backend
npm run build
npm start

# Docker
docker-compose up -d
docker-compose down
```

### Database Commands
```bash
# SQLite (default)
sqlite3 ./data/database.sqlite

# MongoDB
mongo
use information_aggregator_local

# PostgreSQL
psql -U postgres -d information_aggregator_local
```

---

## 📁 Important Files & Their Purpose

| File | Purpose |
|------|---------|
| `frontend/package.json` | Frontend dependencies, build scripts |
| `backend/package.json` | Backend dependencies, start/dev scripts |
| `backend/.env.example` | Environment variables template |
| `database/migrations/` | Schema version control |
| `docker-compose.yml` | Multi-container orchestration |
| `README.md` | Project documentation |

---

## 🔌 API Endpoints (Reference)

### Search
- `GET /api/search?q=keyword&filters=...` - Basic search
- `POST /api/search/advanced` - Advanced search with complex filters

### Documents
- `GET /api/documents/:id` - Get document details
- `GET /api/documents/:id/summary` - Get auto-generated summary
- `POST /api/documents/save` - Save document to collection

### Collections
- `GET /api/collections` - List user collections
- `POST /api/collections` - Create collection
- `PUT /api/collections/:id` - Update collection
- `DELETE /api/collections/:id` - Delete collection

### Sources
- `GET /api/sources` - List available data sources
- `POST /api/sources/sync` - Sync data from sources

---

## 🛠️ Development Environment

### Required Tools
- **Node.js** v16+ (for frontend & backend)
- **npm** or **yarn**
- **Docker & Docker Compose** (optional)
- **Git**

### Recommended VS Code Extensions
- **Frontend**: ES7+ React/Redux/React-Native, Tailwind CSS IntelliSense
- **Backend**: REST Client, Thunder Client
- **General**: Prettier, ESLint, GitLens

### Environment Variables
```env
# Backend (.env)
NODE_ENV=development
PORT=5000
DB_TYPE=sqlite
DB_PATH=./data/database.sqlite

# Frontend (.env.local)
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Information Aggregator
```

---

## ⚠️ Important Notes & Pitfalls

### 1. **Database Setup is Required**
   - You must initialize the database before starting the backend
   - Run `npm run migrate:local` (or mongo/postgres variant)
   - For SQLite: database file created automatically in `./data/`

### 2. **CORS Configuration**
   - Frontend and backend run on different ports during development
   - Ensure CORS is properly configured in backend
   - Frontend URL: `http://localhost:3000` (or Vite port)
   - Backend URL: `http://localhost:5000`

### 3. **API Service Pattern**
   - Always use `services/` layer for API calls, not direct fetch
   - This allows for centralized error handling and request/response transformation
   - Example: `frontend/src/services/searchService.js`

### 4. **Environment-Specific Code**
   - Use environment variables, not hardcoded values
   - Different configurations for dev/test/prod
   - `.env.example` shows all required variables

### 5. **Local Database Considerations**
   - **SQLite**: Good for development, limited concurrency
   - **MongoDB**: More flexible schema, larger dataset support
   - **PostgreSQL**: Best for production, requires setup

### 6. **Search Integration**
   - Meilisearch/Algolia are optional for enhanced search
   - System includes basic full-text search fallback
   - Index must be maintained when documents are added

---

## 🔍 When Writing Code

### Frontend Guidelines
- ✅ Use functional components with hooks
- ✅ Keep components small and focused
- ✅ Extract business logic to services
- ✅ Use Tailwind CSS for styling (avoid inline CSS)
- ✅ Implement proper error boundaries
- ❌ Don't call APIs directly in components
- ❌ Don't use hardcoded URLs or API endpoints

### Backend Guidelines
- ✅ Separate concerns: routes → controllers → services
- ✅ Use middleware for cross-cutting concerns
- ✅ Validate input data before processing
- ✅ Implement proper error handling
- ✅ Use environment variables for configuration
- ❌ Don't query database directly from routes
- ❌ Don't expose internal error details to clients

### Database Guidelines
- ✅ Use migration files for schema changes
- ✅ Write seed files for test data
- ✅ Index frequently queried columns
- ✅ Use transactions for related operations
- ❌ Don't modify schema manually
- ❌ Don't commit database files to version control

---

## 📊 Tech Stack Decision Guide

| Need | Options | Recommended |
|------|---------|-------------|
| **Frontend Framework** | React / Vue / Next.js | React (most common) |
| **Backend Framework** | Express.js / FastAPI | Express.js (Node.js friendly) |
| **Database** | SQLite / MongoDB / PostgreSQL | SQLite (local dev), PostgreSQL (prod) |
| **Styling** | Tailwind / Bootstrap / Material-UI | Tailwind CSS |
| **Search Engine** | Meilisearch / Algolia / Elasticsearch | Meilisearch (lighter weight) |
| **State Management** | Redux / Zustand / Pinia | Zustand (simpler) |
| **API Client** | Axios / Fetch / React Query | Axios (more features) |

---

## 🚦 Getting Started (Quick Reference)

For a new AI agent starting on this project:

1. **Read** [README.md](README.md) for project overview
2. **Check** project structure: `frontend/`, `backend/`, `database/`
3. **Setup development environment** using commands in "Setup & Installation"
4. **Start with frontend or backend** depending on the task
5. **Use `npm run dev`** for development (hot-reload enabled)
6. **Consult `.env.example`** for required configuration
7. **Check test files** for code patterns and examples

---

## 📚 Documentation Links

- **Project Overview**: [README.md](README.md)
- **API Reference**: See `backend/src/routes/`
- **Database Setup**: See [README.md - Local Database Guide](README.md#🗄️-คู่มือ-local-database)
- **Component Examples**: See `frontend/src/components/`

---

## 🔐 Security Considerations

- ✅ Use JWT for authentication
- ✅ Implement rate limiting on APIs
- ✅ Validate all user inputs
- ✅ Sanitize data before storing
- ✅ Use HTTPS in production
- ✅ Store sensitive data in environment variables
- ✅ Implement CORS properly

---

## 💡 Project-Specific Notes

### ภาษาไทย (Thai Language Support)
- UI supports Thai language
- Database supports UTF-8
- API responses include Thai text

### Performance Considerations
- **Real-time search**: Implement debouncing on frontend
- **Data aggregation**: Use caching for frequently accessed data
- **Large documents**: Implement pagination and lazy loading

### Scalability Future Plans
- Multi-source synchronization
- Advanced AI/ML integration
- PWA and mobile app support
- Team collaboration features

---

**Last Updated**: June 2026
**For questions or updates to this guide**, please consult the project README or team documentation.
