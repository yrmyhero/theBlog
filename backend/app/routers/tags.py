"""标签路由。"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter(prefix="/api/tags", tags=["标签"])


@router.get("", response_model=list[schemas.TagResponse])
async def list_tags(db: AsyncSession = Depends(get_db)):
    """获取所有标签，附带文章计数。"""
    result = await db.execute(
        select(
            models.Tag,
            func.count(models.post_tags.c.post_id).label("post_count"),
        )
        .outerjoin(models.post_tags)
        .group_by(models.Tag.id)
        .order_by(models.Tag.created_at)
    )
    rows = result.all()
    return [
        schemas.TagResponse(
            id=tag.id,
            name=tag.name,
            slug=tag.slug,
            created_at=tag.created_at,
            post_count=count,
        )
        for tag, count in rows
    ]


@router.post("", response_model=schemas.TagResponse, status_code=status.HTTP_201_CREATED)
async def create_tag(
    data: schemas.TagCreate,
    db: AsyncSession = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    """创建标签（需登录）。"""
    result = await db.execute(
        select(models.Tag).where(
            (models.Tag.name == data.name) | (models.Tag.slug == data.slug)
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="标签名或 slug 已存在")

    tag = models.Tag(**data.model_dump())
    db.add(tag)
    await db.commit()
    await db.refresh(tag)
    return schemas.TagResponse(
        id=tag.id,
        name=tag.name,
        slug=tag.slug,
        created_at=tag.created_at,
        post_count=0,
    )
