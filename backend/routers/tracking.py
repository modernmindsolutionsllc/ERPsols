"""
routers/tracking.py
───────────────────
Session Tracking micro-service.

Provides a heartbeat endpoint that the React frontend pings every ~60 seconds
to accumulate the user's total active time in the database.
Accessible by any authenticated user (Tier 3).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from database import get_db, User
from dependencies import require_user
from Schemas import HeartbeatRequest, MessageResponse


router = APIRouter(
    prefix="/api/v1/tracking",
    tags=["Session Tracking"],
)


# ── POST /heartbeat ───────────────────────────────────────────────────────────

@router.post("/heartbeat", response_model=MessageResponse)
def heartbeat(
    body: HeartbeatRequest,
    current_user: dict = Depends(require_user),
    db: Session = Depends(get_db),
):
    """
    Session heartbeat — pinged by the frontend every ~60 seconds.

    Adds the reported active_seconds to the user's lifetime
    total_active_seconds counter. This powers the "Session Time"
    metric on the Admin Control Panel.

    Security:
      • Requires a valid JWT (any role)
      • Restriction check runs automatically via get_verified_user
      • active_seconds is capped at 300 to prevent abuse
    """
    user_id = int(current_user["sub"])
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    # Accumulate session time and update last active timestamp
    user.total_active_seconds = (user.total_active_seconds or 0) + body.active_seconds
    user.last_active_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)

    return {"message": f"Heartbeat recorded. Total: {user.total_active_seconds}s"}


# ── POST /disconnect ──────────────────────────────────────────────────────────

@router.post("/disconnect", response_model=MessageResponse)
def disconnect(
    current_user: dict = Depends(require_user),
    db: Session = Depends(get_db),
):
    """
    Exit beacon — fired by the frontend via fetch(keepalive:true) when
    the tab is closed or hidden. Uses standard JWT auth (Authorization header).

    This is the primary mechanism for hyper-accurate "Last Active" tracking.
    The heartbeat endpoint serves as a Double-Lock fallback (accurate to ~60s).
    """
    user_id = int(current_user["sub"])
    user = db.query(User).filter(User.id == user_id).first()

    if user:
        user.last_active_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(user)

    return {"message": "Disconnect recorded."}
