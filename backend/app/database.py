from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# 本地开发默认连 localhost，Docker 内部通过环境变量覆盖为 db
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+asyncmy://myuser:mypassword@localhost:3306/mydb")

engine = create_async_engine(
    DATABASE_URL,
    echo=True,
    pool_size=20,
    max_overflow=10,
    pool_recycle=3600,
)

AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()


async def get_db():
    """FastAPI 依赖注入：每个请求获取一个数据库 session，请求结束自动关闭。"""
    async with AsyncSessionLocal() as session:
        yield session
