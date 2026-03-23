from sqlalchemy.orm import Session

from app.models.hint import Hint
from app.models.problem import Problem, ProblemTag
from app.schemas.admin import ProblemCreateRequest


def create_problem_with_tags(db: Session, payload: ProblemCreateRequest) -> Problem:
    problem = Problem(
        title=payload.title,
        slug=payload.slug,
        description=payload.description,
        difficulty_tier=payload.difficulty_tier,
        starter_code=payload.starter_code,
    )
    db.add(problem)
    db.flush()

    for concept in payload.concepts:
        db.add(ProblemTag(problem_id=problem.id, concept=concept))
    for hint in payload.hints:
        db.add(
            Hint(
                problem_id=problem.id,
                level=hint["level"],
                title=hint["title"],
                content=hint["content"],
                concept=hint["concept"],
            )
        )

    db.commit()
    db.refresh(problem)
    return problem
