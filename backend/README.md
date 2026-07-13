# HEALTH-02 - Doctor-Discovery Platform Demo Backend

This is a scoped-down demo backend for the doctor-discovery platform (**HEALTH-02**), isolating a role-based health article/blog system with three user types (`client`, `doctor`, `admin`).

## Technology Stack
- **Framework**: Django 5.x + Django REST Framework (DRF)
- **Authentication**: JWT via `djangorestframework-simplejwt`
- **Database**: PostgreSQL (Supabase) with local SQLite fallback
- **CORS**: `django-cors-headers`
- **Environment Management**: `python-decouple`

---

## Setup & Installation

### 1. Prerequisites
- Python 3.11.x installed

### 2. Create Virtual Environment & Install Dependencies
Run the following commands from the root `backend/` directory:
```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment (Windows)
.venv\Scripts\activate

# Install requirements
pip install -r requirements.txt
```

### 3. Environment Configuration
Create a `.env` file at the root of the `backend/` directory. You can copy the contents from `.env.example`:
```ini
DJANGO_SECRET_KEY=your-secret-key
DJANGO_DEBUG=True
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
# DATABASE_URL=postgresql://user:pass@host:port/dbname (optional, fallback to sqlite if empty)
```

### 4. Run Migrations & Seed Database
```bash
# Generate and apply migrations
python manage.py migrate

# Seed the database with demo users & articles
python manage.py seed_demo
```
The seeding command creates the following default users:
- **Admin**: `admin` / `adminpass`
- **Verified Doctor**: `dr_verified` / `docpass`
- **Unverified Doctor**: `dr_unverified` / `docpass`
- **Clients**: `client_1` / `clientpass`, `client_2` / `clientpass`

### 5. Start Development Server
```bash
python manage.py runserver
```

---

## Manual Testing (cURL Examples)

All `curl` commands assume the server is running locally at `http://127.0.0.1:8000`.

### 1. Authentication (Login as each role)

#### Login as Admin
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "adminpass"}'
```

#### Login as Verified Doctor
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "dr_verified", "password": "docpass"}'
```

#### Login as Unverified Doctor
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "dr_unverified", "password": "docpass"}'
```

#### Login as Client
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "client_1", "password": "clientpass"}'
```

*Note: The response will include an `"access"` token. Use this token as `Authorization: Bearer <token>` in the following requests.*

---

### 2. List Articles (Server-Side Queryset Filtering)

#### Request as Client (returns only 2 published articles)
```bash
curl -X GET http://127.0.0.1:8000/api/blog/articles/ \
  -H "Authorization: Bearer <CLIENT_ACCESS_TOKEN>"
```

#### Request as Unverified Doctor (returns 2 published articles + their own draft)
```bash
curl -X GET http://127.0.0.1:8000/api/blog/articles/ \
  -H "Authorization: Bearer <UNVERIFIED_DOC_ACCESS_TOKEN>"
```

#### Request as Admin (returns all 4 articles: published + all drafts)
```bash
curl -X GET http://127.0.0.1:8000/api/blog/articles/ \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>"
```

---

### 3. Create Article

#### Create as Unverified Doctor (Should Fail with 403 Forbidden)
```bash
curl -X POST http://127.0.0.1:8000/api/blog/articles/ \
  -H "Authorization: Bearer <UNVERIFIED_DOC_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Unverified Thoughts", "summary": "Unverified post", "content": "This should fail", "status": "draft"}'
```

#### Create as Verified Doctor (Should Succeed with 201 Created)
```bash
curl -X POST http://127.0.0.1:8000/api/blog/articles/ \
  -H "Authorization: Bearer <VERIFIED_DOC_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title": "A New Cardio Insight", "summary": "Heart healthcare advances.", "content": "Modern methods show improvements in cardio care...", "tags": "cardio,care", "status": "draft"}'
```

---

### 4. Verify Doctor (Admin-Only)

Flips the unverified doctor status (`dr_unverified` with User ID `3`) to verified:
```bash
curl -X POST http://127.0.0.1:8000/api/accounts/doctors/3/verify/ \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>"
```
*(After verification, logging in as `dr_unverified` will generate a token with `"is_verified": true` claim, and the user will now be authorized to create articles.)*
