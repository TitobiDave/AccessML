"""Pydantic request/response shapes (what the API accepts and returns)."""
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class ORM(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ---- users ----
class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)


class UserOut(ORM):
    id: int
    name: str
    streak_days: int
    created_at: datetime


# ---- lessons ----
class KeyComponent(BaseModel):
    term: str
    description: str


class LessonContent(BaseModel):
    summary: str
    formula: str | None = None
    key_components: list[KeyComponent] = []
    closing: str | None = None
    badges: list[str] = []


class LessonSummary(ORM):
    id: int
    number: str
    title: str
    topic: str
    duration_seconds: int


class LessonOut(LessonSummary):
    module_id: int
    video_url: str | None
    content: LessonContent


class ModuleOut(ORM):
    id: int
    title: str
    lessons: list[LessonSummary]


# ---- quizzes ----
class QuestionOut(ORM):
    id: int
    prompt: str
    options: list[str]  # note: no answer here


class QuizOut(BaseModel):
    module_id: int
    title: str
    pass_ratio: float
    questions: list[QuestionOut]


class QuizSubmit(BaseModel):
    user_id: int
    answers: list[int | None]  # one entry per question, in order; null = skipped


class QuestionResult(BaseModel):
    question_id: int
    correct: bool
    correct_index: int


class QuizResult(BaseModel):
    score: int
    total: int
    passed: bool
    results: list[QuestionResult]


# ---- progress ----
class QuizProgress(BaseModel):
    module_id: int
    best_score: int
    total: int
    passed: bool


class ProgressOut(BaseModel):
    percent: int
    streak_days: int
    completed_lesson_ids: list[int]
    quizzes: list[QuizProgress]


# ---- certificates ----
class CertificateCreate(BaseModel):
    user_id: int
    student_name: str = Field(min_length=1, max_length=120)
    issue_date: date | None = None


class CertificateOut(ORM):
    verification_code: str
    student_name: str
    course_title: str
    issue_date: date


# ---- AI tutor ----
class DebugRequest(BaseModel):
    code: str = Field(min_length=1, max_length=20_000)
    output: str = Field(default="", max_length=10_000)


class AskRequest(BaseModel):
    question: str = Field(min_length=1, max_length=2_000)
    lesson_id: int | None = None


class TutorReply(BaseModel):
    reply: str
    model: str