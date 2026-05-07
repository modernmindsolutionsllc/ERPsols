"""
dependencies.py
────────────────
Centralised RBAC gatekeepers for the application.
Each dependency validates the caller's JWT-derived role against
the minimum privilege tier required by the route / router.

Security: The restriction check runs on EVERY authenticated request
via get_current_user → _enforce_restriction pipeline.
"""

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from Auth_utils import get_current_user as _decode_jwt
from database import get_db, User


# ═══════════════════════════════════════════════════════════════════════════════
#  RESTRICTION ENFORCEMENT  (Admin Kill Switch)
# ═══════════════════════════════════════════════════════════════════════════════

def get_verified_user(
    current_user: dict = Depends(_decode_jwt),
    db: Session = Depends(get_db),
) -> dict:
    """
    Wraps the JWT decoder and performs a live DB check for the
    `is_restricted` flag. If the user has been banned by an admin,
    they are immediately rejected — even if their JWT is still valid.
    """
    user_id = current_user.get("sub")
    if user_id:
        user = db.query(User).filter(User.id == int(user_id)).first()
        if user and user.is_restricted:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account restricted by Administrator.",
            )
    return current_user


# ── Tier 1 – Admin Only ───────────────────────────────────────────────────────

def require_admin(current_user: dict = Depends(get_verified_user)) -> dict:
    """Strictly requires the caller to hold the **admin** role."""
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin privileges required.",
        )
    return current_user


# ── Tier 2 – Enterprise + Admin ───────────────────────────────────────────────

def require_enterprise(current_user: dict = Depends(get_verified_user)) -> dict:
    """Requires the caller to hold either **admin** or **enterprise** role."""
    if current_user.get("role") not in ("admin", "enterprise"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Enterprise or Admin privileges required.",
        )
    return current_user


# ── Tier 3 – Any Authenticated User ──────────────────────────────────────────

def require_user(current_user: dict = Depends(get_verified_user)) -> dict:
    """Requires the caller to hold any valid role (admin, enterprise, or user)."""
    if current_user.get("role") not in ("admin", "enterprise", "user"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Valid user role required.",
        )
    return current_user
