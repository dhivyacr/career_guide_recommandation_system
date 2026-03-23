from pydantic import BaseModel, Field


class AnalyzeSubmissionRequest(BaseModel):
    problem_id: int | None = None
    language: str = Field(pattern="^(python|java|cpp)$")
    code: str = Field(min_length=10)
    result: str = Field(default="incorrect")
    hint_level_used: int = 0


class MistakeResponse(BaseModel):
    error_type: str
    confidence_score: float
    location: str
    concept_mapping: str


class AnalyzeSubmissionResponse(BaseModel):
    submission_id: int
    status: str
    performance_score: float
    analysis_summary: str
    ast_summary: dict
    cfg_summary: dict
    constructs: list[str]
    mistakes: list[MistakeResponse]
    updated_mastery: list[dict]
