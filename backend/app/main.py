from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.errors import ApiError, api_error_handler, validation_exception_handler
from app.db.base import Base
from app.db.init_db import seed_admin
from app.db.session import SessionLocal, engine


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_admin(db)
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    static_dir = Path(__file__).resolve().parent / "static"
    app = FastAPI(
        title=settings.app_name,
        description="Versioned REST API with JWT auth, RBAC, and task CRUD.",
        version="1.0.0",
        lifespan=lifespan,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_exception_handler(ApiError, api_error_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.include_router(api_router, prefix="/api/v1")

    @app.get("/health", tags=["system"])
    def health() -> dict[str, str]:
        return {"status": "ok", "environment": settings.environment}

    if static_dir.exists():
        assets_dir = static_dir / "assets"
        if assets_dir.exists():
            app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

        @app.get("/", include_in_schema=False)
        def serve_frontend() -> FileResponse:
            return FileResponse(static_dir / "index.html")

        @app.get("/{full_path:path}", include_in_schema=False)
        def serve_frontend_route(full_path: str) -> FileResponse:
            if full_path.startswith("api/"):
                raise ApiError(404, "Not found")
            requested_file = static_dir / full_path
            if requested_file.is_file():
                return FileResponse(requested_file)
            return FileResponse(static_dir / "index.html")

    return app


app = create_app()
