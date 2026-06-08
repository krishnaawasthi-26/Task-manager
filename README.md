# PrimeTrade Backend Intern Assignment

Scalable REST API assignment with authentication, role-based access control, task CRUD, API documentation, Docker/Postgres setup, and a React frontend for testing the APIs.

## Demo Credentials

- Admin email: `admin@example.com`
- Admin password: `AdminPass123!`
- Admin role: `admin`
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- Swagger docs: `http://localhost:8000/docs`
- Postman collection: `docs/postman_collection.json`

Use this admin account to test protected admin APIs, the admin-only user list, and `scope=all` task access.

## Submission Status

| Deliverable | Status | Evidence |
| --- | --- | --- |
| Backend project hosted in GitHub with README.md setup | Ready for GitHub hosting | This README contains setup, API, schema, security, frontend, Docker, and scalability documentation. Add the final GitHub URL after pushing. |
| Working APIs for authentication and CRUD | Implemented | Auth routes under `/api/v1/auth`; task CRUD under `/api/v1/tasks`; admin/user routes under `/api/v1/users`. |
| Basic frontend UI that connects to APIs | Implemented | React/Vite app in `frontend/` supports register, login, protected dashboard, CRUD, and response messages. |
| API documentation | Implemented | Swagger UI at `/docs`; Postman collection at `docs/postman_collection.json`; screenshots below. |
| Short scalability note | Implemented | See the "Scalability Note" section and `SCALABILITY.md`. |

## Assignment Coverage

| Requirement | Implementation |
| --- | --- |
| User registration and login APIs | `POST /api/v1/auth/register`, `POST /api/v1/auth/login` |
| Password hashing | PBKDF2-SHA256 with per-password random salt in `backend/app/core/security.py` |
| JWT authentication | HMAC-SHA256 JWT generation and validation in `backend/app/core/security.py` |
| Role-based access: user vs admin | `require_admin` dependency protects admin routes; task access is owner-or-admin |
| CRUD APIs for secondary entity | `Task` entity supports create, list, read, update, and delete |
| API versioning | All business routes live under `/api/v1` |
| Error handling | Central `ApiError` handler returns consistent JSON error messages |
| Validation | Pydantic request schemas validate email, password length, title length, status values, and description length |
| API documentation | FastAPI Swagger/OpenAPI plus Postman collection |
| Database schema | SQLAlchemy models for `users` and `tasks`; Docker Compose runs Postgres |
| Frontend UI | React/Vite app connects to backend APIs |
| Protected dashboard | Dashboard loads only after JWT-backed `/users/me` succeeds |
| CRUD from UI | Dashboard creates, lists, edits, changes status, and deletes tasks |
| API response messages | UI shows success/error toast messages from API results |
| Secure token handling | JWT is sent through the `Authorization: Bearer <token>` header; backend verifies signature, issuer, and expiry |
| Scalable project structure | Domain folders for api, schemas, models, services, db, core, and frontend |
| Docker deployment | `docker-compose.yml` runs Postgres, backend, and frontend |

## API Documentation Screenshots

### Swagger UI

![Swagger API documentation](docs/images/swagger-api-docs.jpg)

### Postman Collection

![Postman collection preview](docs/images/postman-collection-preview.png)

## Real Testing Evidence

The screenshot below was generated after running the backend tests, frontend production build, and a live API CRUD smoke test against the running FastAPI server.

![Real testing evidence](docs/images/live-testing-evidence.png)

## Tech Stack

- Backend: FastAPI, SQLAlchemy, Pydantic
- Authentication: PBKDF2 password hashing, signed JWT access tokens
- Database: SQLite for fast local development; Postgres in Docker Compose
- Frontend: React, Vite, TypeScript
- API docs: Swagger/OpenAPI and Postman collection
- Deployment support: Dockerfiles and Docker Compose

## Project Structure

```text
.
├── backend/
│   ├── app/
│   │   ├── api/             # Versioned routers and auth dependencies
│   │   ├── core/            # Config, security, and error handling
│   │   ├── db/              # SQLAlchemy engine/session and seed logic
│   │   ├── models/          # User and Task database models
│   │   ├── schemas/         # Pydantic request/response schemas
│   │   ├── services/        # Auth/user service helpers
│   │   └── main.py          # FastAPI app factory
│   └── tests/               # Backend tests
├── frontend/
│   └── src/                 # React UI for auth and task CRUD
├── docs/
│   ├── images/              # Swagger/Postman documentation screenshots
│   └── postman_collection.json
├── docker-compose.yml
├── SCALABILITY.md
└── README.md
```

## Run With Docker

Docker is the recommended evaluator path because it uses Postgres.

```bash
docker compose up --build
```

Open:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`

The Docker setup seeds an admin user automatically:

```text
admin@example.com
AdminPass123!
```

Full deployment notes are in `DEPLOYMENT.md`, including local Docker Compose, one-platform Render hosting, and where to document load balancer/caching/microservices details.

## Run Backend Locally

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Local development defaults to SQLite through `DATABASE_URL=sqlite:///./local.db` in `.env.example`. For Postgres, use the Docker Compose database URL:

```text
postgresql+psycopg://postgres:postgres@localhost:5432/assignment
```

## Run Frontend Locally

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The frontend reads `VITE_API_URL`, which defaults to:

```text
http://localhost:8000/api/v1
```

## GitHub Submission Setup

No GitHub remote is configured in this local folder yet. After creating an empty GitHub repository, push this project with:

```bash
git remote add origin https://github.com/<username>/<repository-name>.git
git add .
git commit -m "Build backend intern assignment"
git branch -M main
git push -u origin main
```

Then replace this placeholder with the final hosted repository URL:

```text
https://github.com/<username>/<repository-name>
```

## Database Schema

### `users`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | integer | Primary key |
| `email` | string, unique | Login identifier |
| `full_name` | string | Display name |
| `hashed_password` | string | PBKDF2-SHA256 hash with salt |
| `role` | string | `user` or `admin` |
| `is_active` | boolean | Used to disable accounts |
| `created_at` | datetime | Created timestamp |

### `tasks`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | integer | Primary key |
| `title` | string | Required task title |
| `description` | text, nullable | Optional task details |
| `status` | string | `todo`, `in_progress`, or `done` |
| `owner_id` | foreign key | References `users.id` |
| `created_at` | datetime | Created timestamp |
| `updated_at` | datetime | Updated timestamp |

## API Reference

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/v1/auth/register` | Public | Register a user account |
| `POST` | `/api/v1/auth/login` | Public | Login and receive JWT |
| `GET` | `/api/v1/users/me` | User/Admin | Read current authenticated user |
| `GET` | `/api/v1/users/` | Admin | List all users |
| `POST` | `/api/v1/users/` | Admin | Create a user or admin |
| `GET` | `/api/v1/tasks/` | User/Admin | List tasks. Users see their own; admins can pass `scope=all` |
| `POST` | `/api/v1/tasks/` | User/Admin | Create a task |
| `GET` | `/api/v1/tasks/{task_id}` | Owner/Admin | Read one task |
| `PATCH` | `/api/v1/tasks/{task_id}` | Owner/Admin | Update one task |
| `DELETE` | `/api/v1/tasks/{task_id}` | Owner/Admin | Delete one task |
| `GET` | `/health` | Public | Health check |

### Auth Flow

1. Register or login.
2. Copy `access_token` from the response.
3. Send protected requests with:

```text
Authorization: Bearer <access_token>
```

### Example Login Request

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"AdminPass123!"}'
```

### Example Create Task Request

```bash
curl -X POST http://localhost:8000/api/v1/tasks/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{"title":"Write assignment","description":"Ship the API and UI","status":"todo"}'
```

## Postman Usage

1. Import `docs/postman_collection.json`.
2. Run `Auth / Login Admin - Sets JWT Token`.
3. Postman stores the JWT in the collection variable `token`.
4. Run `Tasks CRUD / Create Task - Sets taskId`.
5. Postman stores the new task id in the collection variable `taskId`.
6. Run read, update, delete, user, or health requests.

The collection documents auth, current user, admin user management, full task CRUD, and health check requests.

## Frontend Behavior

- Login and register forms call backend auth APIs.
- JWT is stored for the demo session and sent in the `Authorization` header.
- The dashboard calls `/api/v1/users/me`; if the token is invalid, the user is returned to auth.
- Users can create, list, edit, update status, and delete tasks.
- Admins can switch task scope to `all` and view the admin-only user list.
- Success and error responses are shown as toast messages.

## Security Notes

- Passwords are never stored in plain text.
- Tokens are signed with `JWT_SECRET`, include issuer and expiry, and are validated on protected routes.
- Admin-only routes use explicit dependency checks.
- Users can only access their own tasks unless they are admins.
- Pydantic schemas reject malformed emails, short passwords, invalid statuses, overly long titles, and overly long descriptions.
- CORS origins are configured through `ALLOWED_ORIGINS`.

## Scalability Note

The backend is organized by versioned modules so new resources can be added without changing existing routes. For production scale, run multiple API instances behind a load balancer, keep Postgres as the transactional database, add Redis for caching and rate limiting, and move background-heavy workflows into worker processes or separate microservices when load or team ownership requires it.

More detail is available in `SCALABILITY.md`.

## Tests

```bash
cd backend
pytest
```

The test suite covers registration, login, protected routes, admin RBAC, and task CRUD using an isolated SQLite database.

## Verification Commands

```bash
cd backend && .venv/bin/pytest
cd frontend && npm run build
docker compose config
curl http://localhost:8000/health
```
