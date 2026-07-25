"""文件上传路由。"""

import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse

from ..auth import get_current_user
from .. import models, schemas

router = APIRouter(prefix="/api/upload", tags=["上传"])

# 上传目录
UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"}


@router.post("/image", response_model=schemas.ImageUploadResponse)
async def upload_image(
    file: UploadFile = File(...),
    user: models.User = Depends(get_current_user),
):
    """上传图片（需登录）。返回可访问的 URL。"""
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="仅支持 JPG/PNG/GIF/WebP/SVG")

    # 生成唯一文件名
    ext = os.path.splitext(file.filename or "image.png")[1] or ".png"
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = UPLOAD_DIR / filename

    content = await file.read()
    if len(content) > 10 * 1024 * 1024:  # 10MB
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="图片不能超过 10MB")

    filepath.write_bytes(content)
    return schemas.ImageUploadResponse(url=f"/uploads/{filename}")


@router.post("/markdown", response_model=schemas.MarkdownUploadResponse)
async def upload_markdown(
    file: UploadFile = File(...),
    user: models.User = Depends(get_current_user),
):
    """上传 Markdown 文件（需登录）。解析后返回文本内容。"""
    if not file.filename or not file.filename.lower().endswith((".md", ".markdown", ".txt")):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="仅支持 .md / .markdown / .txt 文件")

    content = await file.read()
    try:
        text = content.decode("utf-8")
    except UnicodeDecodeError:
        text = content.decode("gbk", errors="replace")

    if len(text) > 500 * 1024:  # 500KB
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="文件不能超过 500KB")

    return schemas.MarkdownUploadResponse(content=text)
