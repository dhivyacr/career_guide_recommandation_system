from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.problem import Problem
from app.models.user import User
from app.services.hint_service import fetch_hint

router = APIRouter()


@router.get("/{problem_id}/{level}")
def get_hint(
    problem_id: int,
    level: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    return fetch_hint(db, current_user, problem, level)
