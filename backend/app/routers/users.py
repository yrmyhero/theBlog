"""用户路由：个人资料查询与修改。"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter(prefix="/api/users", tags=["用户"])

# ⚠️ 静态路径必须在动态路径 {username} 之前定义，否则 /me 会被当成用户名


@router.get("/me", response_model=schemas.UserResponse)
async def get_my_profile(user: models.User = Depends(get_current_user)):
    """获取当前登录用户的资料（编辑用）。"""
    return user


@router.put("/me", response_model=schemas.UserResponse)
async def update_profile(
    data: schemas.UserProfileUpdate,
    db: AsyncSession = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    """修改个人资料——昵称、头像、简介、链接。"""
    for field in ("nickname", "avatar", "bio", "github", "website"):
        value = getattr(data, field)
        if value is not None:
            setattr(user, field, value)

    await db.commit()
    await db.refresh(user)
    return user


@router.get("", response_model=schemas.UserResponse)
async def get_owner(db: AsyncSession = Depends(get_db)):
    """公开：获取博主信息（第一个用户）。"""
    result = await db.execute(
        select(models.User).where(models.User.is_active == True).order_by(models.User.id).limit(1)
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="暂无用户")
    return user


@router.get("/{username}", response_model=schemas.UserResponse)
async def get_public_profile(username: str, db: AsyncSession = Depends(get_db)):
    """公开：按用户名查看用户资料（博客前台用）。"""
    result = await db.execute(
        select(models.User).where(models.User.username == username)
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="用户不存在")
    return user
