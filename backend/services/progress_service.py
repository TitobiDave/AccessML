"""Progress percentage and learning-streak logic."""
from datetime import date, timedelta

from sqlalchemy.orm import Session

from config import settings
from models import Lesson, LessonProgress, Module, QuizAttempt, User
from schemas import ProgressOut, QuizProgress


def touch_streak(db: Session, user: User) -> None:
    """Call whenever the learner does something meaningful. Extends/reset the daily streak."""
    today = date.today()
    if user.last_active == today:
        return
    user.streak_days = user.streak_days + 1 if user.last_active == today - timedelta(days=1) else 1
    user.last_active = today
    db.add(user)


def quiz_progress(db: Session, user_id: int) -> list[QuizProgress]:
    out = []
    for module in db.query(Module).filter(Module.questions.any()).order_by(Module.order):
        attempts = db.query(QuizAttempt).filter_by(user_id=user_id, module_id=module.id).all()
        best = max(attempts, key=lambda a: a.score / a.total, default=None)
        out.append(
            QuizProgress(
                module_id=module.id,
                best_score=best.score if best else 0,
                total=best.total if best else len(module.questions),
                passed=bool(best and best.score / best.total >= settings.quiz_pass_ratio),
            )
        )
    return out


def compute_progress(db: Session, user: User) -> ProgressOut:
    """Progress = (completed lessons + passed quizzes) / (all lessons + all quizzes)."""
    completed = [
        row.lesson_id for row in db.query(LessonProgress).filter_by(user_id=user.id).order_by(LessonProgress.id)
    ]
    quizzes = quiz_progress(db, user.id)
    total_items = db.query(Lesson).count() + len(quizzes)
    done_items = len(completed) + sum(q.passed for q in quizzes)
    percent = round(100 * done_items / total_items) if total_items else 0
    return ProgressOut(
        percent=percent,
        streak_days=user.streak_days,
        completed_lesson_ids=completed,
        quizzes=quizzes,
    )