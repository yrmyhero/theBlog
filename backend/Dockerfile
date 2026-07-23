# 1.选择基础镜像：根据技术栈选择
FROM python:3.13-slim AS builder

WORKDIR /app

# 1.先只复制依赖文件，利用Docker缓存
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 2.再复制应用代码
COPY . .

# 2.运行
FROM python:3.13-slim

WORKDIR /app

# 复制构建阶段已安装依赖和代码
COPY --from=builder /app /app

# 创建非root用户运行
RUN useradd -m -u 1000 fastapi && chown -R fastapi:fastapi /app
USER fastapi

# 暴露端口
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \ 
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health', timeout=3)" || exit 1

CMD [ "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000" ]
