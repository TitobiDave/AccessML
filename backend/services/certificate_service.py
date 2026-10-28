"""Certificate issuing and unique verification codes."""
import secrets
import string
from datetime import date

from fastapi import HTTPException
from sqlalchemy.orm import Session

from config import settings
from models import Certificate, User
from schemas import CertificateCreate
from services.progress_service import compute_progress

_ALPHABET = string.ascii_uppercase + string.digits


def _new_code(db: Session, year: int) -> str:
    """e.g. ML-7K2Q9X-2026 (same style as the frontend's ML-####-YYYY, but unguessable)."""
    while True:
        code = f"ML-{''.join(secrets.choice(_ALPHABET) for _ in range(6))}-{year}"
        if not db.query(Certificate).filter_by(verification_code=code).first():
            return code


def issue(db: Session, user: User, data: CertificateCreate) -> Certificate:
    if settings.require_completion_for_certificate and compute_progress(db, user).percent < 100:
        raise HTTPException(403, "Complete all lessons and pass all quizzes to earn a certificate.")

    issue_date = data.issue_date or date.today()
    if issue_date > date.today():
        raise HTTPException(422, "Issue date cannot be in the future.")

    cert = Certificate(
        user_id=user.id,
        student_name=data.student_name.strip(),
        course_title=settings.course_title,
        issue_date=issue_date,
        verification_code=_new_code(db, issue_date.year),
    )
    db.add(cert)
    db.commit()
    return cert