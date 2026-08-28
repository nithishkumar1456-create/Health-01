# Integration Tasks

## Phase 1: Extend Existing Models & Fix Accounts
- [x] Extend `accounts/models.py` — add `avatar_url` to User, extend DoctorProfile
- [x] Extend `accounts/serializers.py` — full profile update fields
- [x] Extend `accounts/views.py` — AdminCreateUser, VerificationRequest, fix ProfileUpdateView
- [x] Fix `accounts/urls.py` — admin/users alias, admin/create-user, verify-request

## Phase 2: Extend Doctors App
- [x] Extend `doctors/models.py` — DoctorReview model + rich fields on Doctor
- [x] Extend `doctors/serializers.py` — reviews, rating, bio, etc.
- [x] Extend `doctors/views.py` — DoctorReviewView
- [x] Fix `doctors/urls.py` — add reviews endpoint

## Phase 3: Create Support App
- [x] Create `support/` Django app (models, serializers, views, urls)

## Phase 4: Create Queue App
- [x] Create `queue_app/` Django app (models, serializers, views, urls)

## Phase 5: Wire Up Core URLs & Settings
- [x] Update `core/urls.py` — add support + queue routes
- [x] Update `core/settings.py` — add support + queue to INSTALLED_APPS

## Phase 6: Migrations & Seed
- [x] `makemigrations` for all apps
- [x] `migrate`
- [x] Seed database with test users & doctor listings

## Phase 7: Frontend Config & CORS
- [x] Create `frontend/.env` with VITE_API_BASE_URL=http://localhost:8000
- [x] Update backend `.env` CORS to include Vite dev ports (3000, 5173)
- [x] Updated Quick Fill login buttons and JWT decoder in `api.ts`

## Phase 8: Verify & Test
- [x] Start backend server, test all 10 endpoint categories
- [x] Start frontend, verify integration across all dashboards
