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


# ---- labs ----
class LabSummary(ORM):
    id: int
    slug: str
    title: str
    difficulty: str          # "beginner" | "intermediate" | "advanced"
    estimated_minutes: int


class LabOut(LabSummary):
    lesson_id: int
    instructions: str        # markdown
    starter_code: str
    hints: list[str] = []
    # note: no solution here, same idea as quiz answers


# ---- quizzes ----
class QuestionOut(ORM):
    id: int
    prompt: str
    options: list[str]       # note: no answer here


class QuizSummary(ORM):
    id: int
    slug: str
    title: str
    pass_ratio: float
    question_count: int


class QuizOut(ORM):
    id: int
    slug: str
    lesson_id: int
    title: str
    pass_ratio: float
    questions: list[QuestionOut]


class QuizSubmit(BaseModel):
    user_id: int
    answers: list[int | None]   # one per question, in order; null = skipped


class QuestionResult(BaseModel):
    question_id: int
    correct: bool
    correct_index: int


class QuizResult(BaseModel):
    score: int
    total: int
    passed: bool
    results: list[QuestionResult]

class QuizListItem(BaseModel):
    id: int
    slug: str
    title: str
    pass_ratio: float
    question_count: int
    lesson_id: int
    lesson_number: str
    lesson_title: str
# ---- lessons ----
class KeyComponent(BaseModel):
    term: str
    description: str

class LessonSection(BaseModel):
    slug: str                       # unique within the lesson, used for anchors (#cost-function)
    title: str
    body: str                       # markdown
    formula: str | None = None
    key_components: list[KeyComponent] = []
class LessonContent(BaseModel):
    sections: list[LessonSection] = []
    formula: str | None = None
    key_components: list[KeyComponent] = []
    closing: str | None = None
    badges: list[str] = []

class LessonSummary(ORM):
    id: int
    slug: str
    number: str
    title: str
    topic: str
    duration_seconds: int


class LessonOut(LessonSummary):
    module_id: int
    content: LessonContent
    quizzes: list[QuizSummary] = []
    labs: list[LabSummary] = []


class ModuleOut(ORM):
    id: int
    slug: str
    title: str
    lessons: list[LessonSummary]


# ---- progress ----
class QuizProgress(BaseModel):
    quiz_id: int
    lesson_id: int
    best_score: int
    total: int
    passed: bool


class LabProgress(BaseModel):
    lab_id: int
    lesson_id: int
    completed: bool


class ProgressOut(BaseModel):
    percent: int
    streak_days: int
    completed_lesson_ids: list[int]
    quizzes: list[QuizProgress]
    labs: list[LabProgress]

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