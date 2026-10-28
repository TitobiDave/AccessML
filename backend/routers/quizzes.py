from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from config import settings
from database import get_db
from models import Module
from routers.users import get_user_or_404
from schemas import QuizOut, QuizResult, QuizSubmit
from services.quiz_service import grade_and_record

router = APIRouter(prefix="/api/modules", tags=["quizzes"])


def _module_with_quiz(db: Session, module_id: int) -> Module:
    module = db.get(Module, module_id)
    if not module or not module.questions:
        raise HTTPException(404, "Quiz not found.")
    return module


@router.get("/{module_id}/quiz", response_model=QuizOut)
def get_quiz(module_id: int, db: Session = Depends(get_db)):
    module = _module_with_quiz(db, module_id)
    return QuizOut(
        module_id=module.id,
        title=f"{module.title.split(':')[0]} Checkpoint",
        pass_ratio=settings.quiz_pass_ratio,
        questions=module.questions,
    )


@router.post("/{module_id}/quiz/submit", response_model=QuizResult)
def submit_quiz(module_id: int, data: QuizSubmit, db: Session = Depends(get_db)):
    module = _module_with_quiz(db, module_id)
    user = get_user_or_404(db, data.user_id)
    return grade_and_record(db, module, user, data.answers)