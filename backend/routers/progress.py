from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Lesson, LessonProgress
from routers.users import get_user_or_404
from schemas import ProgressOut
from services.progress_service import compute_progress, touch_streak

router = APIRouter(prefix="/api/users/{user_id}", tags=["progress"])


@router.get("/progress", response_model=ProgressOut)
def get_progress(user_id: int, db: Session = Depends(get_db)):
    return compute_progress(db, get_user_or_404(db, user_id))


@router.post("/lessons/{lesson_id}/complete", response_model=ProgressOut)
def complete_lesson(user_id: int, lesson_id: int, db: Session = Depends(get_db)):
    user = get_user_or_404(db, user_id)
    if not db.get(Lesson, lesson_id):
        raise HTTPException(404, "Lesson not found.")
    # idempotent: completing twice is a no-op
    if not db.query(LessonProgress).filter_by(user_id=user_id, lesson_id=lesson_id).first():
        db.add(LessonProgress(user_id=user_id, lesson_id=lesson_id))
    touch_streak(db, user)
    db.commit()
    return compute_progress(db, user)