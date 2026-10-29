from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Lab, LabProgress, LessonProgress
from routers.users import get_user_or_404
from schemas import LabOut, LabResult, LabSubmit
from services.progress_service import touch_streak

router = APIRouter(prefix="/api", tags=["labs"])


def _norm(text: str) -> list[str]:
    return [line.rstrip() for line in text.strip().splitlines()]


@router.get("/labs/{lab_id}", response_model=LabOut)
def read_lab(lab_id: int, db: Session = Depends(get_db)):
    lab = db.get(Lab, lab_id)
    if not lab:
        raise HTTPException(404, "Lab not found.")
    return lab


@router.post("/labs/{lab_id}/submit", response_model=LabResult)
def submit_lab(lab_id: int, body: LabSubmit, db: Session = Depends(get_db)):
    lab = db.get(Lab, lab_id)
    if not lab:
        raise HTTPException(404, "Lab not found.")
    user = get_user_or_404(db, body.user_id)

    for snippet in lab.required_code or []:
        if snippet not in body.code:
            return LabResult(passed=False, message=f"Your solution should use `{snippet}`.")
    for snippet in lab.forbidden_code or []:
        if snippet in body.code:
            return LabResult(passed=False, message=f"This lab doesn't allow `{snippet}`.")

    got, want = _norm(body.output), _norm(lab.expected_output)
    if got != want:
        for i, (g, w) in enumerate(zip(got, want), start=1):
            if g != w:
                return LabResult(passed=False, message=f"Output differs on line {i}. Compare it with the instructions.")
        return LabResult(passed=False, message=f"Expected {len(want)} lines of output but got {len(got)}.")

    # Passed: record it (idempotent)
    if not db.query(LabProgress).filter_by(user_id=user.id, lab_id=lab.id).first():
        db.add(LabProgress(user_id=user.id, lab_id=lab.id))
        db.flush()

    lesson_labs = {l.id for l in lab.lesson.labs}
    done = {
        r.lab_id
        for r in db.query(LabProgress).filter(
            LabProgress.user_id == user.id, LabProgress.lab_id.in_(lesson_labs)
        )
    }
    lesson_completed = lesson_labs <= done
    if lesson_completed and not db.query(LessonProgress).filter_by(
        user_id=user.id, lesson_id=lab.lesson_id
    ).first():
        db.add(LessonProgress(user_id=user.id, lesson_id=lab.lesson_id))

    touch_streak(db, user)
    db.commit()
    return LabResult(passed=True, message="Lab passed!", lesson_completed=lesson_completed)