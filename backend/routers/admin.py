"""
routers/admin.py
────────────────
Admin Control Panel (ACP) micro-service.

Provides real-time user management, role-filtered listing,
and the restriction "kill switch" for immediate account lockout.
All endpoints gated behind `require_admin` — only admins can access.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from database import get_db, User, Role
from dependencies import require_admin
from Schemas import UserAdminResponse, RestrictUserRequest, MessageResponse


router = APIRouter(
    prefix="/api/v1/admin",
    tags=["Admin ACP"],
    dependencies=[Depends(require_admin)],  # Global RBAC — admin only
)


# ── GET /users ─────────────────────────────────────────────────────────────────

@router.get("/users", response_model=list[UserAdminResponse])
def list_users(
    role: Optional[str] = Query(None, description="Filter by role name (admin, enterprise, user)"),
    search: Optional[str] = Query(None, description="Search by email or username (case-insensitive)"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    """
    Return all users with optional role filtering and search.

    Query params:
      • role   — exact match on role name (e.g. ?role=enterprise)
      • search — partial, case-insensitive match on email OR username
    """
    query = db.query(User).join(Role, User.role_id == Role.id)

    # ── Role filter ────────────────────────────────────────────────────────────
    if role:
        query = query.filter(Role.name == role.lower())

    # ── Search filter (email or username) ──────────────────────────────────────
    if search:
        search_term = f"%{search.lower()}%"
        query = query.filter(
            (User.email.ilike(search_term)) | (User.username.ilike(search_term))
        )

    users = query.all()

    # ── Map ORM → response (resolve role name) ────────────────────────────────
    results = []
    for user in users:
        role_name = user.role_rel.name if user.role_rel else "unknown"
        results.append(
            UserAdminResponse(
                id=user.id,
                email=user.email,
                username=user.username,
                role=role_name,
                created_at=user.created_at,
                total_active_seconds=user.total_active_seconds or 0,
                is_restricted=bool(user.is_restricted),
            )
        )

    return results


# ── PUT /users/{user_id}/restrict ──────────────────────────────────────────────

@router.put("/users/{user_id}/restrict", response_model=MessageResponse)
def restrict_user(
    user_id: int,
    body: RestrictUserRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    """
    Admin Kill Switch — toggle a user's restricted status.

    Security: When is_restricted is set to True, the user is immediately
    blocked on their next API call via the get_verified_user dependency,
    regardless of JWT validity.
    """
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found.",
        )

    # Prevent admins from restricting themselves
    caller_id = int(current_user["sub"])
    if user.id == caller_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot restrict your own account.",
        )

    user.is_restricted = body.is_restricted
    db.commit()

    action = "restricted" if body.is_restricted else "unrestricted"
    return {"message": f"User '{user.username}' has been {action} successfully."}
