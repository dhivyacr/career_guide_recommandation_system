from sqlalchemy.orm import Session

from app.models.concept_mastery import ConceptMastery
from app.models.user import User
from app.services.constants import CONCEPTS

ALPHA = 0.2


def ensure_mastery_rows(db: Session, user: User) -> list[ConceptMastery]:
    rows = db.query(ConceptMastery).filter(ConceptMastery.user_id == user.id).all()
    existing = {row.concept for row in rows}
    for concept in CONCEPTS:
        if concept not in existing:
            row = ConceptMastery(user_id=user.id, concept=concept, score=0.5)
            db.add(row)
            rows.append(row)
    db.commit()
    return db.query(ConceptMastery).filter(ConceptMastery.user_id == user.id).all()


def performance_from_status(result: str, hint_level_used: int) -> float:
    if result == "solved" and hint_level_used == 0:
        return 1.0
    if result == "solved" and hint_level_used == 1:
        return 0.7
    if result == "solved" and hint_level_used >= 2:
        return 0.4
    return 0.0


def update_mastery(
    db: Session, user: User, performance: float, touched_concepts: list[str]
) -> list[dict]:
    rows = ensure_mastery_rows(db, user)
    updated = []
    for row in rows:
        if row.concept in touched_concepts:
            row.score = row.score + ALPHA * (performance - row.score)
        updated.append({"concept": row.concept, "score": round(row.score, 3)})
    db.commit()
    return sorted(updated, key=lambda item: item["concept"])
