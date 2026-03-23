from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.submission import AnalyzeSubmissionRequest, AnalyzeSubmissionResponse
from app.services.analytics_service import build_dashboard_snapshot
from app.services.submission_service import analyze_and_store_submission

router = APIRouter()


@router.post("/analyze", response_model=AnalyzeSubmissionResponse)
def analyze_submission(
    payload: AnalyzeSubmissionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AnalyzeSubmissionResponse:
    result = analyze_and_store_submission(db, current_user, payload)
    return AnalyzeSubmissionResponse(**result)


@router.get("/recent")
def recent_submissions(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> dict:
    snapshot = build_dashboard_snapshot(db, current_user)
    return {"items": snapshot["recent_submissions"]}
