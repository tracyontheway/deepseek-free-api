# 部署指南

本文档详细介绍 DeepSeek Free API 的各种部署方式。

## 部署方式概览

| 方式 | 难度 | 适用场景 | 费用 |
|------|------|---------|------|
| Docker | ⭐ | 个人服务器、云服务器 | 服务器费用 |
| Vercel | ⭐⭐ | Serverless 部署 | 免费/付费 |
| Render | ⭐⭐ | 云平台部署 | 免费/付费 |
| 原生部署 | ⭐⭐⭐ | VPS、本地环境 | 服务器费用 |

---

## Docker 部署

### 方式一：直接运行

```bash
# 拉取镜像
docker pull vinlic/deepseek-free-api:latest

# 运行容器
docker run -d \
  --name deepseek-api \
  -p 8000:8000 \
  -e TZ=Asia/Shanghai \
  -e DEEP_SEEK_CHAT_AUTHORIZATION=your-token \
  vinlic/deepseek-free-api:latest
```

### 方式二：Docker Compose

创建 `docker-compose.yml` 文件：

```yaml
version: '3'

services:
  deepseek-api:
    image: vinlic/deepseek-free-api:latest
    container_name: deepseek-api
    restart: always
    ports:
      - "8000:8000"
    environment:
      - TZ=Asia/Shanghai
      - DEEP_SEEK_CHAT_AUTHORIZATION=your-token
    volumes:
      - ./logs:/app/logs  # 可选：日志持久化
```

启动服务：

```bash
docker-compose up -d
```

### 容器管理命令

```bash
# 查看日志
docker logs -f deepseek-api

# 重启容器
docker restart deepseek-api

# 停止容器
docker stop deepseek-api

# 删除容器
docker rm deepseek-api

# 进入容器
docker exec -it deepseek-api sh
```

---

## Vercel 部署

### 前提条件

- GitHub 账号
- Vercel 账号
- Node.js 18+

### 方式一：CLI 部署

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录 Vercel
vercel login

# 3. 克隆项目
git clone https://github.com/LLM-Red-Team/deepseek-free-api
cd deepseek-free-api

# 4. 部署到生产环境
vercel --prod
```

### 方式二：GitHub 集成

1. Fork 项目到你的 GitHub
2. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
3. 点击 "New Project"
4. 导入你 Fork 的仓库
5. 配置环境变量：
   - `DEEP_SEEK_CHAT_AUTHORIZATION`: 你的 Token
6. 点击 "Deploy"

### 配置环境变量

在 Vercel 项目设置中添加：

| 变量名 | 值 |
|--------|-----|
| `DEEP_SEEK_CHAT_AUTHORIZATION` | 你的 DeepSeek Token |

### 注意事项

⚠️ **Vercel 免费版限制**:
- 请求超时 10 秒
- 可能遇到 504 错误
- 建议使用付费版或部署到其他平台

---

## Render 部署

### 方式一：Web Dashboard

1. Fork 项目到 GitHub
2. 访问 [Render Dashboard](https://dashboard.render.com/)
3. 点击 "New" → "Web Service"
4. 连接 GitHub 仓库
5. 配置服务：

| 配置项 | 值 |
|--------|-----|
| Name | deepseek-api |
| Region | 选择离你最近的区域 |
| Branch | main |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |

6. 添加环境变量：

| 变量名 | 值 |
|--------|-----|
| `DEEP_SEEK_CHAT_AUTHORIZATION` | 你的 Token |

7. 点击 "Create Web Service"

### 方式二：render.yaml

创建 `render.yaml` 文件：

```yaml
services:
  - type: web
    name: deepseek-api
    env: node
    region: singapore
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: DEEP_SEEK_CHAT_AUTHORIZATION
        value: your-token
      - key: NODE_ENV
        value: production
```

### Render 免费版注意事项

⚠️ **限制**:
- 15 分钟无活动后休眠
- 首次请求需要等待唤醒
- 每月 750 小时免费

### 保活方案

使用定时任务定期 ping 服务：

```bash
# 使用 cron-job.org 或类似服务
# 每 10 分钟 ping 一次
*/10 * * * * curl https://your-app.onrender.com/ping
```

---

## 原生部署

### 前提条件

- Node.js 18+
- npm 或 yarn
- PM2 (可选)

### 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/LLM-Red-Team/deepseek-free-api
cd deepseek-free-api

# 2. 安装依赖
npm install

# 3. 构建项目
npm run build

# 4. 配置环境变量
export DEEP_SEEK_CHAT_AUTHORIZATION=your-token

# 5. 启动服务
npm start
```

### 使用 PM2 管理

```bash
# 安装 PM2
npm i -g pm2

# 启动服务
pm2 start dist/index.js --name deepseek-api

# 设置开机自启
pm2 startup
pm2 save

# 查看日志
pm2 logs deepseek-api

# 重启服务
pm2 restart deepseek-api

# 停止服务
pm2 stop deepseek-api

# 删除服务
pm2 delete deepseek-api
```

### Systemd 服务配置

创建 `/etc/systemd/system/deepseek-api.service`：

```ini
[Unit]
Description=DeepSeek Free API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/deepseek-free-api
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10
Environment=DEEP_SEEK_CHAT_AUTHORIZATION=your-token
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

管理命令：

```bash
# 重载配置
sudo systemctl daemon-reload

# 启动服务
sudo systemctl start deepseek-api

# 开机自启
sudo systemctl enable deepseek-api

# 查看状态
sudo systemctl status deepseek-api

# 查看日志
sudo journalctl -u deepseek-api -f
```

---

## Nginx 反向代理

### 基础配置

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 流式响应优化

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # 流式响应优化
        proxy_buffering off;
        chunked_transfer_encoding on;
        tcp_nopush on;
        tcp_nodelay on;
        keepalive_timeout 120;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
}
```

### HTTPS 配置

```nginx
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:8000;
        # ... 其他配置
    }
}

# HTTP 重定向 HTTPS
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## Kubernetes 部署

### Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: deepseek-api
spec:
  replicas: 2
  selector:
    matchLabels:
      app: deepseek-api
  template:
    metadata:
      labels:
        app: deepseek-api
    spec:
      containers:
      - name: deepseek-api
        image: vinlic/deepseek-free-api:latest
        ports:
        - containerPort: 8000
        env:
        - name: DEEP_SEEK_CHAT_AUTHORIZATION
          valueFrom:
            secretKeyRef:
              name: deepseek-secret
              key: token
```

### Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: deepseek-api
spec:
  selector:
    app: deepseek-api
  ports:
  - port: 80
    targetPort: 8000
  type: LoadBalancer
```

---

## 环境变量说明

| 变量名 | 必填 | 默认值 | 说明 |
|--------|------|--------|------|
| `DEEP_SEEK_CHAT_AUTHORIZATION` | 否 | - | DeepSeek Token，多个用逗号分隔 |
| `PORT` | 否 | 8000 | 服务端口 |
| `NODE_ENV` | 否 | development | 运行环境 |

---

上一章：[模型说明](./04-models.md) | 下一章：[配置说明](./06-configuration.md)
