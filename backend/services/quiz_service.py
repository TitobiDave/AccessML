"""Server-side quiz grading, so correct answers never reach the browser early."""
from fastapi import HTTPException
from sqlalchemy.orm import Session

from config import settings
from models import Module, QuizAttempt, User
from schemas import QuestionResult, QuizResult
from services.progress_service import touch_streak


def grade_and_record(db: Session, module: Module, user: User, answers: list[int | None]) -> QuizResult:
    questions = module.questions
    if len(answers) != len(questions):
        raise HTTPException(422, f"Expected {len(questions)} answers, got {len(answers)}.")

    results = [
        QuestionResult(question_id=q.id, correct=(a == q.answer_index), correct_index=q.answer_index)
        for q, a in zip(questions, answers)
    ]
    score = sum(r.correct for r in results)
    total = len(questions)

    db.add(QuizAttempt(user_id=user.id, module_id=module.id, score=score, total=total))
    touch_streak(db, user)
    db.commit()

    return QuizResult(
        score=score,
        total=total,
        passed=total > 0 and score / total >= settings.quiz_pass_ratio,
        results=results,
    )