from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Blog API")

# 允许前端跨域请求（React 开发/生产都需要）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境请替换为具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Hello FastAPI"}

# 健康检查接口（Dockerfile 的 HEALTHCHECK 依赖此路径）
@app.get("/health")
def health_check():
    return {"status": "ok"}