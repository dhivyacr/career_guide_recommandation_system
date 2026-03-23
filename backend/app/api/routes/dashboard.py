from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.services.analytics_service import build_dashboard_snapshot

router = APIRouter()


@router.get("/overview")
def dashboard_overview(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> dict:
    return build_dashboard_snapshot(db, current_user)
