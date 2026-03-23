from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.services.recommendation_service import get_next_recommendation

router = APIRouter()


@router.get("/next")
def next_recommendation(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> dict:
    return get_next_recommendation(db, current_user)
