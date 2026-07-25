"""分类路由。"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter(prefix="/api/categories", tags=["分类"])


@router.get("", response_model=list[schemas.CategoryResponse])
async def list_categories(db: AsyncSession = Depends(get_db)):
    """获取所有分类，附带文章计数。"""
    result = await db.execute(
        select(
            models.Category,
            func.count(models.Post.id).label("post_count"),
        )
        .outerjoin(models.Post)
        .group_by(models.Category.id)
        .order_by(models.Category.created_at)
    )
    rows = result.all()
    return [
        schemas.CategoryResponse(
            id=cat.id,
            name=cat.name,
            slug=cat.slug,
            description=cat.description,
            created_at=cat.created_at,
            post_count=count,
        )
        for cat, count in rows
    ]


@router.post("", response_model=schemas.CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    data: schemas.CategoryCreate,
    db: AsyncSession = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    """创建分类（需登录）。"""
    result = await db.execute(
        select(models.Category).where(
            (models.Category.name == data.name) | (models.Category.slug == data.slug)
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="分类名或 slug 已存在")

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    """删除分类（需登录）。已分类的文章 category_id 会被置为 NULL。"""
    cat = await db.get(models.Category, category_id)
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="分类不存在")
    await db.delete(cat)
    await db.commit()


@router.post("", response_model=schemas.CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    data: schemas.CategoryCreate,
    db: AsyncSession = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    """创建分类（需登录）。"""
    result = await db.execute(
        select(models.Category).where(
            (models.Category.name == data.name) | (models.Category.slug == data.slug)
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="分类名或 slug 已存在")

    cat = models.Category(**data.model_dump())
    db.add(cat)
    await db.commit()
    await db.refresh(cat)
    return schemas.CategoryResponse(
        id=cat.id,
        name=cat.name,
        slug=cat.slug,
        description=cat.description,
        created_at=cat.created_at,
        post_count=0,
    )
