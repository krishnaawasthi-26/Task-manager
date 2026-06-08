# Deployment Guide

This project can be run in one place locally with Docker Compose, or hosted in one cloud dashboard with Render.

## Option 1: Run Everything Locally In One Command

This is the easiest way to demo the complete project because it starts:

- React frontend
- FastAPI backend
- Postgres database

Run:

```bash
cd /Users/krishnaawasthi/Documents/submit
docker compose up --build
```

Open:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:8000
Swagger:  http://localhost:8000/docs
```

Admin login:

```text
admin@example.com
AdminPass123!
```

Stop everything:

```bash
docker compose down
```

Stop and remove the local Postgres volume:

```bash
docker compose down -v
```

## Option 2: Host Everything On Render

Render is the simplest single-platform deployment option for this assignment because one dashboard can create:

- Static Site for the frontend
- Web Service for the backend
- Postgres database

Important: Render free Postgres databases expire after 30 days, so this is fine for assignment review but not long-term production storage.

## Step 1: Push The Code To GitHub

Create an empty GitHub repository, then run:

```bash
cd /Users/krishnaawasthi/Documents/submit
git add .
git commit -m "Build backend intern assignment"
git branch -M main
git remote add origin https://github.com/<username>/<repository-name>.git
git push -u origin main
```

## Step 2: Create Postgres On Render

In Render:

1. Click `New`.
2. Select `Postgres`.
3. Choose the free plan if available.
4. Copy the database connection string.

Use the external connection string for manual setup, or the internal connection string if the backend service is also on Render.

## Step 3: Create Backend Web Service

In Render:

1. Click `New`.
2. Select `Web Service`.
3. Connect the GitHub repository.
4. Use these settings:

```text
Root Directory: backend
Runtime: Python
Build Command: pip install -r requirements.txt
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Environment variables:

```text
APP_NAME=PrimeTrade Backend Assignment
ENVIRONMENT=production
DATABASE_URL=<Render Postgres connection string>
JWT_SECRET=<long random secret>
ACCESS_TOKEN_EXPIRE_MINUTES=60
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=AdminPass123!
ALLOWED_ORIGINS=https://<your-frontend-service>.onrender.com
```

After deploy, test:

```text
https://<your-backend-service>.onrender.com/health
https://<your-backend-service>.onrender.com/docs
```

## Step 4: Create Frontend Static Site

In Render:

1. Click `New`.
2. Select `Static Site`.
3. Connect the same GitHub repository.
4. Use these settings:

```text
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: dist
```

Environment variable:

```text
VITE_API_URL=https://<your-backend-service>.onrender.com/api/v1
```

After frontend deploy, copy its URL and update the backend `ALLOWED_ORIGINS` value to match it.

## Render Blueprint Option

Render also supports infrastructure-as-code through a root-level `render.yaml` file. For this project, manual setup is clearer because the frontend needs the final backend URL in `VITE_API_URL`, and the backend needs the final frontend URL in `ALLOWED_ORIGINS`.

If you want to use a Blueprint later, define:

- One `web` service with `runtime: python` and `rootDir: backend`
- One `web` service with `runtime: static` and `rootDir: frontend`
- One Postgres database under `databases`
- Backend `DATABASE_URL` using `fromDatabase`
- Secret values such as `JWT_SECRET` with generated values

## Where To Write Load Balancer, Redis, Microservices

Write the short version in `README.md` under:

```text
## Scalability Note
```

Write the detailed version in:

```text
SCALABILITY.md
```

For this assignment, the note should mention:

- Multiple backend instances behind a load balancer
- Postgres as the source of truth
- Redis for caching and rate limiting
- Background workers for slow jobs
- Microservices only when traffic or team ownership requires it
- Docker/CI/CD for deployment readiness

## Useful Verification Commands

Backend tests:

```bash
cd backend
.venv/bin/pytest
```

Frontend build:

```bash
cd frontend
npm run build
```

Docker Compose validation:

```bash
docker compose config
```

Health check:

```bash
curl http://localhost:8000/health
```

