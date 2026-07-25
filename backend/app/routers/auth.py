"""认证路由：注册、登录。"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from .. import models, schemas
from ..auth import (
    hash_password,
    verify_password,
    create_access_token,
)

router = APIRouter(prefix="/api/auth", tags=["认证"])


@router.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
async def register(data: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    """注册新用户。"""

    # 检查用户名是否已存在
    result = await db.execute(select(models.User).where(models.User.username == data.username))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="用户名已被注册")

    # 检查邮箱是否已存在
    result = await db.execute(select(models.User).where(models.User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="邮箱已被注册")

    user = models.User(
        username=data.username,
        email=data.email,
        hashed_password=hash_password(data.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.post("/login", response_model=schemas.TokenResponse)
async def login(data: schemas.UserLogin, db: AsyncSession = Depends(get_db)):
    """登录，返回 JWT token。"""

    # 查用户
    result = await db.execute(select(models.User).where(models.User.username == data.username))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="用户名或密码错误")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="账号已被禁用")

    token = create_access_token(data={"sub": str(user.id), "username": user.username})
    return schemas.TokenResponse(access_token=token)
