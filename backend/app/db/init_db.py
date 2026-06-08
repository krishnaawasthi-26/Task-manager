from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import hash_password
from app.models.user import User


def seed_admin(db: Session) -> None:
    settings = get_settings()
    if not settings.admin_email or not settings.admin_password:
        return

    existing = db.scalar(select(User).where(User.email == settings.admin_email.lower()))
    if existing:
        return

    admin = User(
        email=settings.admin_email.lower(),
        full_name="Assignment Admin",
        hashed_password=hash_password(settings.admin_password),
        role="admin",
    )
    db.add(admin)
    db.commit()

