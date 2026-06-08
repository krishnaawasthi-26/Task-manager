from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_admin
from app.core.errors import ApiError
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreateByAdmin, UserRead
from app.services.auth import create_user_by_admin, get_user_by_email

router = APIRouter()


@router.get("/me", response_model=UserRead)
def read_current_user(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.get("/", response_model=list[UserRead])
def list_users(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> list[User]:
    return list(db.scalars(select(User).order_by(User.created_at.desc())))


@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreateByAdmin,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> User:
    if get_user_by_email(db, payload.email):
        raise ApiError(409, "Email is already registered")
    return create_user_by_admin(db, payload)

