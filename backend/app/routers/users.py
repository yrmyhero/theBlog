"""用户路由：个人资料查询与修改。"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter(prefix="/api/users", tags=["用户"])


@router.get("/me", response_model=schemas.UserResponse)
async def get_profile(user: models.User = Depends(get_current_user)):
    """获取当前用户资料。"""
    return user


@router.put("/me", response_model=schemas.UserResponse)
async def update_profile(
    data: schemas.UserProfileUpdate,
    db: AsyncSession = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    """修改个人资料——昵称、头像、简介。"""
    if data.nickname is not None:
        user.nickname = data.nickname
    if data.avatar is not None:
        user.avatar = data.avatar
    if data.bio is not None:
        user.bio = data.bio

    await db.commit()
    await db.refresh(user)
    return user
