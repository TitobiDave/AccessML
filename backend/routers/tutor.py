from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from config import settings
from database import get_db
from models import Lesson
from schemas import AskRequest, DebugRequest, TutorReply
from services import tutor_service

router = APIRouter(prefix="/api/tutor", tags=["tutor"])


@router.post("/debug", response_model=TutorReply)
async def debug(data: DebugRequest):
    reply = await tutor_service.debug_code(data.code, data.output)
    return TutorReply(reply=reply, model=settings.groq_model)


@router.post("/ask", response_model=TutorReply)
async def ask(data: AskRequest, db: Session = Depends(get_db)):
    context = None
    if data.lesson_id is not None:
        lesson = db.get(Lesson, data.lesson_id)
        if not lesson:
            raise HTTPException(404, "Lesson not found.")
        context = f"{lesson.title} ({lesson.topic}): {lesson.content.get('summary', '')}"
    reply = await tutor_service.ask(data.question, context)
    return TutorReply(reply=reply, model=settings.groq_model)