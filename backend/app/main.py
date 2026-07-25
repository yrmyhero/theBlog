from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .routers import auth, posts, categories, tags, upload, users

app = FastAPI(title="Blog API")

# 允许前端跨域请求（React 开发/生产都需要）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ────────── 静态文件（上传的图片）──────────
uploads_dir = Path(__file__).resolve().parent.parent / "uploads"
uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

# ────────── 注册路由 ──────────
app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(tags.router)
app.include_router(posts.router)
app.include_router(upload.router)
app.include_router(users.router)


@app.get("/")
def read_root():
    return {"message": "Hello FastAPI"}


@app.get("/health")
def health_check():
    return {"status": "ok"}
