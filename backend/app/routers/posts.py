"""文章路由：列表/详情/创建/更新/删除。"""

import re
import secrets

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter(prefix="/api/posts", tags=["文章"])


# ────────── 工具函数 ──────────

def _slugify(title: str) -> str:
    """将标题转为 URL slug，纯中文标题用时间戳。"""
    # 只保留 ASCII 字母数字和连字符
    text = title.lower().strip()
    # 把非字母数字转为连字符
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    if not text:
        # 纯中文标题 → 用随机后缀
        text = f"post-{secrets.token_hex(4)}"
    # 截断保证不超 256
    return text[:250]


async def _check_slug_unique(db: AsyncSession, slug: str, exclude_id: int = 0) -> str:
    """检查 slug 唯一性，不唯一则加随机后缀。"""
    original = slug
    result = await db.execute(
        select(models.Post).where(models.Post.slug == slug, models.Post.id != exclude_id)
    )
    while result.scalar_one_or_none():
        slug = f"{original}-{secrets.token_hex(3)}"
        result = await db.execute(
            select(models.Post).where(models.Post.slug == slug, models.Post.id != exclude_id)
        )
    return slug


# ────────── 公开接口 ──────────

@router.get("", response_model=schemas.PaginatedResponse[schemas.PostListResponse])
async def list_posts(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(10, ge=1, le=50, description="每页数量"),
    category: str | None = Query(None, description="按分类 slug 筛选"),
    tag: str | None = Query(None, description="按标签 slug 筛选"),
    q: str | None = Query(None, description="搜索关键词（标题）"),
    db: AsyncSession = Depends(get_db),
):
    """公开：文章列表，支持分页、分类/标签筛选、关键词搜索。"""

    # 基础查询：只查已发布的文章
    base = select(models.Post).where(models.Post.is_published == True)

    # 按分类筛选
    if category:
        base = base.join(models.Category).where(models.Category.slug == category)

    # 按标签筛选
    if tag:
        base = base.join(models.Post.tags).where(models.Tag.slug == tag)

    # 关键词搜索
    if q:
        base = base.where(models.Post.title.contains(q))

    # 总数
    count_stmt = select(func.count()).select_from(base.subquery())
    total = (await db.execute(count_stmt)).scalar() or 0

    # 排序 + 分页
    stmt = (
        base
        .options(selectinload(models.Post.author))
        .options(selectinload(models.Post.category))
        .options(selectinload(models.Post.tags))
        .order_by(models.Post.is_top.desc(), models.Post.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    result = await db.execute(stmt)
    posts = result.scalars().unique().all()

    return schemas.PaginatedResponse(
        total=total,
        page=page,
        page_size=page_size,
        items=[schemas.PostListResponse.model_validate(p) for p in posts],
    )


@router.get("/{slug}", response_model=schemas.PostResponse)
async def get_post(slug: str, db: AsyncSession = Depends(get_db)):
    """公开：文章详情，自动增加阅读量。"""
    stmt = (
        select(models.Post)
        .where(models.Post.slug == slug)
        .options(selectinload(models.Post.author))
        .options(selectinload(models.Post.category))
        .options(selectinload(models.Post.tags))
    )
    result = await db.execute(stmt)
    post = result.scalar_one_or_none()

    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="文章不存在")

    # 只有已发布的才增加阅读量
    if post.is_published:
        post.view_count += 1
        await db.commit()

    return post


# ────────── 需认证接口 ──────────

@router.get("/id/{post_id}", response_model=schemas.PostResponse)
async def get_post_by_id(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    """管理端：按 ID 获取文章完整内容（需登录）。"""
    stmt = (
        select(models.Post)
        .where(models.Post.id == post_id)
        .options(selectinload(models.Post.author))
        .options(selectinload(models.Post.category))
        .options(selectinload(models.Post.tags))
    )
    result = await db.execute(stmt)
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="文章不存在")
    return post


@router.post("", response_model=schemas.PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    data: schemas.PostCreate,
    db: AsyncSession = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    """创建文章（需登录）。"""
    # 生成 slug
    slug = await _check_slug_unique(db, _slugify(data.title))

    # 处理标签
    tags: list[models.Tag] = []
    if data.tag_ids:
        tag_result = await db.execute(
            select(models.Tag).where(models.Tag.id.in_(data.tag_ids))
        )
        tags = tag_result.scalars().all()

    # 验证分类存在（如果提供了）
    if data.category_id:
        cat = await db.get(models.Category, data.category_id)
        if not cat:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="分类不存在")

    post = models.Post(
        title=data.title,
        slug=slug,
        content=data.content,
        summary=data.summary,
        cover_image=data.cover_image,
        is_published=data.is_published,
        is_top=data.is_top,
        author_id=user.id,
        category_id=data.category_id,
        tags=tags,
    )
    db.add(post)
    await db.commit()

    # 重新加载关联数据
    await db.refresh(post, ["author", "category", "tags"])
    return post


@router.put("/{post_id}", response_model=schemas.PostResponse)
async def update_post(
    post_id: int,
    data: schemas.PostUpdate,
    db: AsyncSession = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    """更新文章（需登录，仅允许作者本人）。"""
    stmt = (
        select(models.Post)
        .where(models.Post.id == post_id)
        .options(selectinload(models.Post.category))
        .options(selectinload(models.Post.tags))
    )
    result = await db.execute(stmt)
    post = result.scalar_one_or_none()

    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="文章不存在")
    if post.author_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="只能修改自己的文章")

    # 只更新传了的字段
    if data.title is not None:
        post.title = data.title
        post.slug = await _check_slug_unique(db, _slugify(data.title), exclude_id=post.id)
    if data.content is not None:
        post.content = data.content
    if data.summary is not None:
        post.summary = data.summary
    if data.cover_image is not None:
        post.cover_image = data.cover_image
    if data.is_published is not None:
        post.is_published = data.is_published
    if data.is_top is not None:
        post.is_top = data.is_top
    if data.category_id is not None:
        cat = await db.get(models.Category, data.category_id)
        if not cat:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="分类不存在")
        post.category_id = data.category_id
    if data.tag_ids is not None:
        tag_result = await db.execute(
            select(models.Tag).where(models.Tag.id.in_(data.tag_ids))
        )
        post.tags = tag_result.scalars().all()

    await db.commit()
    await db.refresh(post, ["author", "category", "tags"])
    return post


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    """删除文章（需登录，仅允许作者本人）。"""
    stmt = select(models.Post).where(models.Post.id == post_id)
    result = await db.execute(stmt)
    post = result.scalar_one_or_none()

    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="文章不存在")
    if post.author_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="只能删除自己的文章")

    await db.delete(post)
    await db.commit()
