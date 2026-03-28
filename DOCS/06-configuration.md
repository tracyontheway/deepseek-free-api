# 配置说明

本文档详细介绍 DeepSeek Free API 的配置选项。

## 环境变量

### 基础配置

| 变量名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `DEEP_SEEK_CHAT_AUTHORIZATION` | string | - | DeepSeek Token，多个用逗号分隔 |
| `PORT` | number | 8000 | 服务监听端口 |
| `HOST` | string | 0.0.0.0 | 服务监听地址 |
| `NODE_ENV` | string | development | 运行环境 |

### 配置示例

```bash
# .env 文件
DEEP_SEEK_CHAT_AUTHORIZATION=token1,token2,token3
PORT=8000
HOST=0.0.0.0
NODE_ENV=production
```

---

## 配置文件

### 服务配置 (configs/dev/service.yml)

```yaml
# 服务名称
name: deepseek-free-api

# 绑定地址
bindAddress: http://localhost:8000

# URL 前缀
urlPrefix: /v1

# 服务配置
server:
  host: 0.0.0.0
  port: 8000
```

### 系统配置 (configs/dev/system.yml)

```yaml
# 请求体配置
requestBody:
  jsonLimit: 10mb
  formLimit: 10mb
  textLimit: 10mb
  multipart: true

# 请求日志
requestLog: true

# 日志级别
logLevel: info
```

---

## Token 配置

### 单 Token 配置

```bash
DEEP_SEEK_CHAT_AUTHORIZATION=eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...
```

### 多 Token 配置

多个 Token 用逗号分隔，服务会自动负载均衡：

```bash
DEEP_SEEK_CHAT_AUTHORIZATION=token1,token2,token3
```

### 动态 Token

也可以在请求时动态传入 Token：

```bash
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Authorization: Bearer your-dynamic-token" \
  -H "Content-Type: application/json" \
  -d '{"model": "deepseek-chat", "messages": [...]}'
```

**优先级**: 请求头 Token > 环境变量 Token

---

## 日志配置

### 日志级别

| 级别 | 说明 |
|------|------|
| debug | 调试信息 |
| info | 一般信息 |
| warn | 警告信息 |
| error | 错误信息 |

### 日志输出

日志输出到控制台，支持以下格式：

```
[2024-01-15 10:30:45] [INFO] Server listening on port 8000
[2024-01-15 10:30:50] [INFO] <- POST /v1/chat/completions 1234ms
[2024-01-15 10:31:00] [ERROR] Request failed: timeout
```

---

## CORS 配置

默认启用 CORS，允许跨域访问：

```javascript
// 默认 CORS 配置
{
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'X-Requested-With'
  ]
}
```

---

## 超时配置

### 请求超时

```yaml
# 系统配置
timeout:
  connect: 15000    # 连接超时 15s
  request: 120000   # 请求超时 120s
```

### 重试配置

```yaml
retry:
  maxCount: 3       # 最大重试次数
  delay: 5000       # 重试延迟 5s
```

---

## 安全配置

### 建议

1. **不要公开暴露服务** - 使用认证或防火墙保护
2. **使用 HTTPS** - 生产环境必须使用 HTTPS
3. **限制访问 IP** - 只允许可信 IP 访问
4. **定期更换 Token** - 避免长期使用同一 Token

### Nginx IP 白名单

```nginx
location / {
    allow 192.168.1.0/24;
    allow 10.0.0.0/8;
    deny all;
    
    proxy_pass http://127.0.0.1:8000;
}
```

---

## 性能优化

### Node.js 优化

```bash
# 启用 Source Map
node --enable-source-maps dist/index.js

# 增加内存限制
node --max-old-space-size=4096 dist/index.js

# 使用 no-node-snapshot 优化启动
node --no-node-snapshot dist/index.js
```

### PM2 集群模式

```bash
# 根据 CPU 核心数启动多个实例
pm2 start dist/index.js -i max --name deepseek-api
```

### Nginx 优化

```nginx
# 启用 gzip 压缩
gzip on;
gzip_types application/json;

# 连接池
upstream deepseek {
    least_conn;
    server 127.0.0.1:8000;
    server 127.0.0.1:8001;
    server 127.0.0.1:8002;
}

server {
    location / {
        proxy_pass http://deepseek;
    }
}
```

---

## 监控配置

### 健康检查

```bash
# 简单健康检查
curl http://localhost:8000/ping

# Token 检查
curl -X POST http://localhost:8000/token/check \
  -H "Content-Type: application/json" \
  -d '{"token": "your-token"}'
```

### Prometheus 监控

可集成 Prometheus 进行监控：

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'deepseek-api'
    static_configs:
      - targets: ['localhost:8000']
```

---

上一章：[部署指南](./05-deployment.md) | 下一章：[开发指南](./07-development.md)
