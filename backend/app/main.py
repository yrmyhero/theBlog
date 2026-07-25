from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import auth, posts, categories, tags

app = FastAPI(title="Blog API")

# 允许前端跨域请求（React 开发/生产都需要）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境请替换为具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ────────── 注册路由 ──────────
app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(tags.router)
app.include_router(posts.router)


@app.get("/")
def read_root():
    return {"message": "Hello FastAPI"}


@app.get("/health")
def health_check():
    return {"status": "ok"}