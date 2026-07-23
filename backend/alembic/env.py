import os
import sys
import asyncio
from logging.config import fileConfig

from alembic import context

# ---------- 确保 backend 目录在 Python 搜索路径中 ----------
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# ---------- Alembic Config ----------
config = context.config

# ---------- logging ----------
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ---------- 从环境变量读取数据库 URL ----------
from app.database import DATABASE_URL
config.set_main_option("sqlalchemy.url", DATABASE_URL)

# ---------- 导入 Base 和所有模型（autogenerate 用它来检测表变化） ----------
from app.database import Base, engine
import app.models  # noqa: F401 — 触发模型注册到 Base.metadata

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """离线模式：只生成 SQL 脚本，不连接数据库。"""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    """在已有的数据库连接上执行迁移。"""
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """异步方式：复用 app.database 中已创建的异步引擎。"""
    async with engine.connect() as connection:
        # run_sync — 在异步连接上执行同步回调，Alembic 必须如此
        await connection.run_sync(do_run_migrations)


def run_migrations_online() -> None:
    """在线模式：连接数据库并执行迁移。"""
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
