from sqlalchemy import (
    Column, BigInteger, String, Text, Boolean, DateTime,
    ForeignKey, Table, func
)
from sqlalchemy.dialects.mysql import LONGTEXT
from sqlalchemy.orm import relationship

from .database import Base

# --------------------- 多对多关联表 ---------------------
post_tags = Table(
    "post_tags",
    Base.metadata,
    Column("post_id", BigInteger, ForeignKey("posts.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", BigInteger, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)

# --------------------- 用户 ---------------------
class User(Base):
    __tablename__ = "users"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    username = Column(String(64), unique=True, nullable=False, index=True)
    email = Column(String(128), unique=True, nullable=False)
    hashed_password = Column(String(256), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    nickname = Column(String(64), default="", nullable=False)
    avatar = Column(String(512), default="", nullable=False)
    bio = Column(Text, default="", nullable=False)
    github = Column(String(256), default="", nullable=False)
    website = Column(String(256), default="", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    posts = relationship("Post", back_populates="author")

# --------------------- 分类 ---------------------
class Category(Base):
    __tablename__ = "categories"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    name = Column(String(64), unique=True, nullable=False)
    slug = Column(String(64), unique=True, nullable=False, index=True)
    description = Column(String(256), default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    posts = relationship("Post", back_populates="category")

# --------------------- 标签 ---------------------
class Tag(Base):
    __tablename__ = "tags"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    name = Column(String(64), unique=True, nullable=False)
    slug = Column(String(64), unique=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    posts = relationship("Post", secondary=post_tags, back_populates="tags")

# --------------------- 文章 ---------------------
class Post(Base):
    __tablename__ = "posts"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    title = Column(String(256), nullable=False)
    slug = Column(String(256), unique=True, nullable=False, index=True)
    content = Column(LONGTEXT, nullable=False)
    summary = Column(String(512), default="")
    cover_image = Column(String(512), default="")
    is_published = Column(Boolean, default=False, nullable=False)
    is_top = Column(Boolean, default=False, nullable=False)
    view_count = Column(BigInteger, default=0, nullable=False)

    author_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(BigInteger, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    author = relationship("User", back_populates="posts")
    category = relationship("Category", back_populates="posts")
    tags = relationship("Tag", secondary=post_tags, back_populates="posts")
