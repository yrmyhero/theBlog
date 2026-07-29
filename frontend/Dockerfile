# 构建
FROM node:22-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install && npm cache clean --force

COPY . .

RUN npm run build

# 基于Apache托管静态文件的情况运行
FROM httpd:alpine

# 将静态文件复制到Apache的默认网站目录
COPY --from=builder /app/dist /usr/local/apache2/htdocs/

# 启用 SPA 路由回退：加载 mod_rewrite 并将规则直接写入 Apache 主配置
RUN sed -i 's|#LoadModule rewrite_module modules/mod_rewrite.so|LoadModule rewrite_module modules/mod_rewrite.so|' /usr/local/apache2/conf/httpd.conf && \
    printf '<Directory "/usr/local/apache2/htdocs">\nOptions Indexes FollowSymLinks\nAllowOverride None\nRequire all granted\n\nRewriteEngine On\nRewriteBase /\nRewriteCond %%{REQUEST_FILENAME} !-f\nRewriteCond %%{REQUEST_FILENAME} !-d\nRewriteRule . /index.html [L]\n</Directory>\n' >> /usr/local/apache2/conf/httpd.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD [ "httpd-foreground" ] 
