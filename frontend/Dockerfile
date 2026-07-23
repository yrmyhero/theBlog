# 构建
FROM node:18-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json
RUN npm ci && npm cache clean --force

COPY . .

RUN npm run build

# 基于Apache托管静态文件的情况运行
FROM httpd:alpine

# 将静态文件复制到Apache的默认网站目录
COPY --from=builder /app/dist /usr/local/apache2/htdocs/

# 修改Apache配置，启用.htaccess支持(用于路由回退)
# 替换htdocs目录的AllowOverride 为All
RUN sed -i '/<Directory "\/usr\/local\/apache2\/htdocs">/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/g' /usr/local/apache2/conf/httpd.conf

# 将.htaccess复制到网站根目录
COPY .htaccess /usr/local/apache2/htdocs

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD [ "httpd-foreground" ] 
