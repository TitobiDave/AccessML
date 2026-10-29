from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Lesson, LessonProgress, Module, Quiz, QuizAttempt
from routers.users import get_user_or_404
from schemas import QuestionResult, QuizListItem, QuizOut, QuizResult, QuizSubmit
from services.progress_service import touch_streak

router = APIRouter(prefix="/api", tags=["quizzes"])


@router.get("/quizzes", response_model=list[QuizListItem])
def list_quizzes(db: Session = Depends(get_db)):
    quizzes = (
        db.query(Quiz)
        .join(Lesson, Quiz.lesson_id == Lesson.id)
        .join(Module, Lesson.module_id == Module.id)
        .order_by(Module.order, Lesson.order, Quiz.order)
        .all()
    )
    return [
        QuizListItem(
            id=q.id,
            slug=q.slug,
            title=q.title,
            pass_ratio=q.pass_ratio,
            question_count=q.question_count,
            lesson_id=q.lesson_id,
            lesson_number=q.lesson.number,
            lesson_title=q.lesson.title,
        )
        for q in quizzes
    ]


@router.get("/quizzes/{quiz_id}", response_model=QuizOut)
def read_quiz(quiz_id: int, db: Session = Depends(get_db)):
    quiz = db.get(Quiz, quiz_id)
    if not quiz:
        raise HTTPException(404, "Quiz not found.")
    return quiz


@router.post("/quizzes/{quiz_id}/submit", response_model=QuizResult)
def submit_quiz(quiz_id: int, body: QuizSubmit, db: Session = Depends(get_db)):
    quiz = db.get(Quiz, quiz_id)
    if not quiz:
        raise HTTPException(404, "Quiz not found.")
    user = get_user_or_404(db, body.user_id)

    questions = quiz.questions
    if len(body.answers) != len(questions):
        raise HTTPException(422, "Provide one answer per question.")

    results = [
        QuestionResult(
            question_id=q.id,
            correct=(a == q.answer_index),
            correct_index=q.answer_index,
        )
        for q, a in zip(questions, body.answers)
    ]
    score = sum(r.correct for r in results)
    total = len(questions)
    passed = total > 0 and score / total >= quiz.pass_ratio

    db.add(QuizAttempt(user_id=user.id, quiz_id=quiz.id, score=score, total=total))

    # Passing the quiz completes its lesson (idempotent)
    if passed:
        already = db.query(LessonProgress).filter_by(user_id=user.id, lesson_id=quiz.lesson_id).first()
        if not already:
            db.add(LessonProgress(user_id=user.id, lesson_id=quiz.lesson_id))
        touch_streak(db, user)

    db.commit()
    return QuizResult(score=score, total=total, passed=passed, results=results)