from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Problem(Base):
    __tablename__ = "problems"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(200), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    difficulty_tier: Mapped[int] = mapped_column(Integer, nullable=False)
    starter_code: Mapped[str | None] = mapped_column(Text, nullable=True)

    tags = relationship("ProblemTag", back_populates="problem", cascade="all, delete-orphan")
    hints = relationship("Hint", back_populates="problem", cascade="all, delete-orphan")
    submissions = relationship("Submission", back_populates="problem")


class ProblemTag(Base):
    __tablename__ = "problem_tags"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    problem_id: Mapped[int] = mapped_column(ForeignKey("problems.id"), nullable=False)
    concept: Mapped[str] = mapped_column(String(80), nullable=False)

    problem = relationship("Problem", back_populates="tags")
