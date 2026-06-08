from typing import Literal

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.errors import ApiError
from app.db.session import get_db
from app.models.task import Task
from app.models.user import User
from app.schemas.task import TaskCreate, TaskRead, TaskStatus, TaskUpdate

router = APIRouter()


def _get_accessible_task(db: Session, task_id: int, user: User) -> Task:
    task = db.get(Task, task_id)
    if not task:
        raise ApiError(404, "Task not found")
    if task.owner_id != user.id and user.role != "admin":
        raise ApiError(403, "You do not have access to this task")
    return task


@router.get("/", response_model=list[TaskRead])
def list_tasks(
    scope: Literal["mine", "all"] = Query(default="mine"),
    task_status: TaskStatus | None = Query(default=None, alias="status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Task]:
    if scope == "all" and current_user.role != "admin":
        raise ApiError(403, "Only admins can list all tasks")

    stmt = select(Task).order_by(Task.updated_at.desc())
    if scope == "mine":
        stmt = stmt.where(Task.owner_id == current_user.id)
    if task_status:
        stmt = stmt.where(Task.status == task_status)
    return list(db.scalars(stmt))


@router.post("/", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(
    payload: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Task:
    task = Task(
        title=payload.title.strip(),
        description=payload.description.strip() if payload.description else None,
        status=payload.status,
        owner_id=current_user.id,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("/{task_id}", response_model=TaskRead)
def read_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Task:
    return _get_accessible_task(db, task_id, current_user)


@router.patch("/{task_id}", response_model=TaskRead)
def update_task(
    task_id: int,
    payload: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Task:
    task = _get_accessible_task(db, task_id, current_user)
    update_data = payload.model_dump(exclude_unset=True)
    if "title" in update_data and update_data["title"] is not None:
        task.title = update_data["title"].strip()
    if "description" in update_data:
        description = update_data["description"]
        task.description = description.strip() if description else None
    if "status" in update_data and update_data["status"] is not None:
        task.status = update_data["status"]
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Response:
    task = _get_accessible_task(db, task_id, current_user)
    db.delete(task)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

