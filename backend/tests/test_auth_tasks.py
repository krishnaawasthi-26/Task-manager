import os
import tempfile
from pathlib import Path

os.environ["DATABASE_URL"] = f"sqlite:///{Path(tempfile.mkdtemp()) / 'test.db'}"
os.environ["JWT_SECRET"] = "test-secret"
os.environ["ADMIN_EMAIL"] = ""
os.environ["ADMIN_PASSWORD"] = ""

from fastapi.testclient import TestClient  # noqa: E402

from app.core.security import hash_password  # noqa: E402
from app.db.base import Base  # noqa: E402
from app.db.session import SessionLocal, engine  # noqa: E402
from app.main import app  # noqa: E402
from app.models.user import User  # noqa: E402


def _reset_db() -> None:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def _register(client: TestClient, email: str = "user@example.com") -> str:
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "full_name": "Test User",
            "password": "Password123!",
        },
    )
    assert response.status_code == 201
    return response.json()["access_token"]


def _create_admin() -> None:
    with SessionLocal() as db:
        db.add(
            User(
                email="admin@example.com",
                full_name="Admin User",
                hashed_password=hash_password("AdminPass123!"),
                role="admin",
            )
        )
        db.commit()


def test_register_login_and_task_crud() -> None:
    _reset_db()
    with TestClient(app) as client:
        token = _register(client)
        headers = {"Authorization": f"Bearer {token}"}

        create_response = client.post(
            "/api/v1/tasks/",
            headers=headers,
            json={"title": "Write assignment", "description": "Ship the backend", "status": "todo"},
        )
        assert create_response.status_code == 201
        task_id = create_response.json()["id"]

        list_response = client.get("/api/v1/tasks/", headers=headers)
        assert list_response.status_code == 200
        assert len(list_response.json()) == 1

        update_response = client.patch(
            f"/api/v1/tasks/{task_id}",
            headers=headers,
            json={"status": "done"},
        )
        assert update_response.status_code == 200
        assert update_response.json()["status"] == "done"

        delete_response = client.delete(f"/api/v1/tasks/{task_id}", headers=headers)
        assert delete_response.status_code == 204


def test_protected_routes_and_admin_rbac() -> None:
    _reset_db()
    _create_admin()
    with TestClient(app) as client:
        user_token = _register(client, "person@example.com")
        user_headers = {"Authorization": f"Bearer {user_token}"}

        unauthenticated = client.get("/api/v1/tasks/")
        assert unauthenticated.status_code == 401

        forbidden = client.get("/api/v1/users/", headers=user_headers)
        assert forbidden.status_code == 403

        login_response = client.post(
            "/api/v1/auth/login",
            json={"email": "admin@example.com", "password": "AdminPass123!"},
        )
        assert login_response.status_code == 200
        admin_headers = {"Authorization": f"Bearer {login_response.json()['access_token']}"}

        users_response = client.get("/api/v1/users/", headers=admin_headers)
        assert users_response.status_code == 200
        assert len(users_response.json()) == 2

