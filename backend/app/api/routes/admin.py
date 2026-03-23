from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.user import User
from app.schemas.admin import AdminAnalyticsResponse, ProblemCreateRequest
from app.services.analytics_service import build_admin_analytics
from app.services.problem_service import create_problem_with_tags

router = APIRouter()


@router.post("/problems", status_code=status.HTTP_201_CREATED)
def add_problem(
    payload: ProblemCreateRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> dict:
    problem = create_problem_with_tags(db, payload)
    return {"id": problem.id, "title": problem.title}


@router.get("/students")
def list_students(
    db: Session = Depends(get_db), _: User = Depends(require_admin)
) -> dict:
    students = db.query(User).filter(User.role == "student").all()
    return {
        "items": [
            {
                "id": student.id,
                "name": student.name,
                "email": student.email,
                "created_at": student.created_at,
            }
            for student in students
        ]
    }


@router.get("/analytics", response_model=AdminAnalyticsResponse)
def admin_analytics(
    db: Session = Depends(get_db), _: User = Depends(require_admin)
) -> AdminAnalyticsResponse:
    return AdminAnalyticsResponse(**build_admin_analytics(db))
