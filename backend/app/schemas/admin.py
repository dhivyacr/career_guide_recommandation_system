from pydantic import BaseModel, Field


class ProblemCreateRequest(BaseModel):
    title: str = Field(min_length=3)
    slug: str = Field(min_length=3)
    description: str = Field(min_length=20)
    difficulty_tier: int = Field(ge=1, le=5)
    starter_code: str | None = None
    concepts: list[str]
    hints: list[dict]


class AdminAnalyticsResponse(BaseModel):
    total_students: int
    total_problems: int
    total_submissions: int
    concept_distribution: list[dict]
    difficulty_progression: list[dict]
