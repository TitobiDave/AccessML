from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Certificate
from routers.users import get_user_or_404
from schemas import CertificateCreate, CertificateOut
from services.certificate_service import issue

router = APIRouter(prefix="/api/certificates", tags=["certificates"])


@router.post("", response_model=CertificateOut, status_code=201)
def create_certificate(data: CertificateCreate, db: Session = Depends(get_db)):
    user = get_user_or_404(db, data.user_id)
    return issue(db, user, data)


@router.get("/verify/{code}", response_model=CertificateOut)
def verify_certificate(code: str, db: Session = Depends(get_db)):
    cert = db.query(Certificate).filter_by(verification_code=code.upper()).first()
    if not cert:
        raise HTTPException(404, "No certificate matches that code.")
    return cert