"""Progress calculations."""
from datetime import date, timedelta

from sqlalchemy.orm import Session

from models import Lab, LabProgress, Lesson, LessonProgress, Quiz, QuizAttempt, User
from schemas import LabProgress as LabProgressOut
from schemas import ProgressOut, QuizProgress


def quiz_progress(db: Session, user_id: int) -> list[QuizProgress]:
    results = []
    for quiz in db.query(Quiz).order_by(Quiz.lesson_id, Quiz.order):
        attempts = (
            db.query(QuizAttempt)
            .filter_by(user_id=user_id, quiz_id=quiz.id)
            .all()
        )
        if not attempts:
            continue
        best = max(attempts, key=lambda a: a.score / a.total if a.total else 0)
        passed = best.total > 0 and best.score / best.total >= quiz.pass_ratio
        results.append(
            QuizProgress(
                quiz_id=quiz.id,
                lesson_id=quiz.lesson_id,
                best_score=best.score,
                total=best.total,
                passed=passed,
            )
        )
    return results


def lab_progress(db: Session, user_id: int) -> list[LabProgressOut]:
    done = {
        row.lab_id
        for row in db.query(LabProgress).filter_by(user_id=user_id)
    }
    return [
        LabProgressOut(lab_id=lab.id, lesson_id=lab.lesson_id, completed=lab.id in done)
        for lab in db.query(Lab).order_by(Lab.lesson_id, Lab.order)
    ]


def compute_progress(db: Session, user: User) -> ProgressOut:
    completed = [
        row.lesson_id
        for row in db.query(LessonProgress).filter_by(user_id=user.id)
    ]
    total_lessons = db.query(Lesson).count()
    percent = round(len(completed) / total_lessons * 100) if total_lessons else 0

    return ProgressOut(
        percent=percent,
        streak_days=user.streak_days,
        completed_lesson_ids=completed,
        quizzes=quiz_progress(db, user.id),
        labs=lab_progress(db, user.id),
    )


def touch_streak(db: Session, user: User) -> None:
    today = date.today()
    if user.last_active == today:
        return
    if user.last_active == today - timedelta(days=1):
        user.streak_days += 1
    else:
        user.streak_days = 1
    user.last_active = today