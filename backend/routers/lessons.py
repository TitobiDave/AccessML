from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Lesson, Module
from schemas import LessonOut, ModuleOut

router = APIRouter(prefix="/api", tags=["lessons"])


@router.get("/modules", response_model=list[ModuleOut])
def list_modules(db: Session = Depends(get_db)):
    return db.query(Module).order_by(Module.order).all()


@router.get("/lessons/{lesson_id}", response_model=LessonOut)
def read_lesson(lesson_id: int, db: Session = Depends(get_db)):
    lesson = db.get(Lesson, lesson_id)
    if not lesson:
        raise HTTPException(404, "Lesson not found.")
    return lesson