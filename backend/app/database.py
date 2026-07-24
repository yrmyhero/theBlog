from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
import os

DATABASE_URL = os.getenv("DATABASE_URL", "mysql+asyncmy://myuser:mypassword@db:3306/mydb")

engine = create_async_engine(DATABASE_URL, 
                             echo=True,
                             pool_size=20,
                             max_overflow=10,
                             pool_recycle=3600,
                             pool_pre_ping=True
                             )

AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()