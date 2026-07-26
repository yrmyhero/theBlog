from __future__ import annotations

from datetime import datetime
from typing import Optional, TypeVar, Generic

from pydantic import BaseModel, ConfigDict, Field

# ═══════════════════ 通用 ═══════════════════

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    """分页响应，T 是具体的数据类型（如 PostListResponse）。"""
    total: int = Field(..., description="总记录数")
    page: int = Field(..., description="当前页码")
    page_size: int = Field(..., description="每页数量")
    items: list[T] = Field(..., description="当前页数据")


# ═══════════════════ 用户 / 认证 ═══════════════════

class UserCreate(BaseModel):
    """注册请求。"""
    username: str = Field(..., min_length=2, max_length=64, description="用户名")
    email: str = Field(..., max_length=128, description="邮箱")
    password: str = Field(..., min_length=6, max_length=128, description="密码")


class UserLogin(BaseModel):
    """登录请求。"""
    username: str = Field(..., description="用户名")
    password: str = Field(..., description="密码")


class TokenResponse(BaseModel):
    """登录成功返回的 JWT。"""
    access_token: str = Field(..., description="JWT 令牌")
    token_type: str = Field("bearer", description="令牌类型")


class UserResponse(BaseModel):
    """对外返回的用户信息（不包含密码）。"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: str
    nickname: str = ""
    avatar: str = ""
    bio: str = ""
    github: str = ""
    website: str = ""
    is_active: bool
    is_superuser: bool
    created_at: datetime


class UserProfileUpdate(BaseModel):
    """修改个人资料——昵称、头像、简介、链接。"""
    nickname: Optional[str] = Field(None, max_length=64, description="昵称")
    avatar: Optional[str] = Field(None, max_length=512, description="头像 URL")
    bio: Optional[str] = Field(None, description="个人简介")
    github: Optional[str] = Field(None, max_length=256, description="GitHub 主页")
    website: Optional[str] = Field(None, max_length=256, description="个人网站")


class ChangePasswordRequest(BaseModel):
    """修改密码。"""
    old_password: str = Field(..., description="旧密码")
    new_password: str = Field(..., min_length=6, max_length=128, description="新密码")


class DeleteAccountRequest(BaseModel):
    """注销账号，需提供密码确认。"""
    password: str = Field(..., description="当前密码")


# ═══════════════════ 分类 ═══════════════════

class CategoryCreate(BaseModel):
    """创建分类。"""
    name: str = Field(..., min_length=1, max_length=64, description="分类名")
    slug: str = Field(..., min_length=1, max_length=64, description="URL 别名")
    description: str = Field("", max_length=256, description="描述")


class CategoryResponse(BaseModel):
    """对外返回的分类信息。"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    description: str
    created_at: datetime
    post_count: int = Field(0, description="该分类下的文章数")


# ═══════════════════ 标签 ═══════════════════

class TagCreate(BaseModel):
    """创建标签。"""
    name: str = Field(..., min_length=1, max_length=64, description="标签名")
    slug: str = Field(..., min_length=1, max_length=64, description="URL 别名")


class TagResponse(BaseModel):
    """对外返回的标签信息。"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    created_at: datetime
    post_count: int = Field(0, description="该标签下的文章数")


# ═══════════════════ 文章 ═══════════════════

class PostCreate(BaseModel):
    """创建 / 更新文章。用户只需传标题和内容，其余字段由后端生成。"""
    title: str = Field(..., min_length=1, max_length=256, description="文章标题")
    content: str = Field(..., min_length=1, description="Markdown 正文")
    summary: str = Field("", max_length=512, description="摘要")
    cover_image: str = Field("", max_length=512, description="封面图 URL")
    is_published: bool = Field(False, description="是否发布")
    is_top: bool = Field(False, description="是否置顶")
    category_id: Optional[int] = Field(None, description="分类 ID")
    tag_ids: list[int] = Field(default_factory=list, description="标签 ID 列表")


class PostUpdate(BaseModel):
    """更新文章。所有字段可选，只更新传了的字段。"""
    title: Optional[str] = Field(None, min_length=1, max_length=256, description="文章标题")
    content: Optional[str] = Field(None, min_length=1, description="Markdown 正文")
    summary: Optional[str] = Field(None, max_length=512, description="摘要")
    cover_image: Optional[str] = Field(None, max_length=512, description="封面图 URL")
    is_published: Optional[bool] = Field(None, description="是否发布")
    is_top: Optional[bool] = Field(None, description="是否置顶")
    category_id: Optional[int] = Field(None, description="分类 ID")
    tag_ids: Optional[list[int]] = Field(None, description="标签 ID 列表")


class PostListResponse(BaseModel):
    """列表页返回的文章摘要（不含正文，减少传输量）。"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    slug: str
    summary: str
    cover_image: str
    is_top: bool
    view_count: int
    created_at: datetime
    updated_at: datetime
    author: UserResponse
    category: Optional[CategoryResponse] = None
    tags: list[TagResponse] = Field(default_factory=list)


# ═══════════════════ 上传 ═══════════════════

class ImageUploadResponse(BaseModel):
    url: str = Field(..., description="图片访问 URL")


class MarkdownUploadResponse(BaseModel):
    content: str = Field(..., description="Markdown 文件内容")


class PostResponse(BaseModel):
    """文章详情页返回的完整信息（含正文）。"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    slug: str
    content: str
    summary: str
    cover_image: str
    is_published: bool
    is_top: bool
    view_count: int
    created_at: datetime
    updated_at: datetime
    author: UserResponse
    category: Optional[CategoryResponse] = None
    tags: list[TagResponse] = Field(default_factory=list)


# ═══════════════════ 上传 ═══════════════════

class ImageUploadResponse(BaseModel):
    url: str = Field(..., description="图片访问 URL")


class MarkdownUploadResponse(BaseModel):
    content: str = Field(..., description="Markdown 文件内容")
