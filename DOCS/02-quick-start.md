# 快速开始

本指南帮助你在 5 分钟内启动 DeepSeek Free API 服务。

## 前置条件

- Node.js 18+ 或 Docker
- DeepSeek 账号及 Token

## 获取 DeepSeek Token

### 步骤 1: 登录 DeepSeek

访问 [DeepSeek Chat](https://chat.deepseek.com/) 并登录你的账号。

### 步骤 2: 打开开发者工具

按 `F12` 打开浏览器开发者工具。

### 步骤 3: 获取 Token

1. 切换到 **Application** 标签页
2. 左侧菜单选择 **Local Storage** → `https://chat.deepseek.com`
3. 找到 `userToken` 条目
4. 复制其 Value 值

![获取 Token](../doc/example-0.png)

> ⚠️ **安全提示**: Token 是敏感信息，请妥善保管，不要泄露给他人。

## 方式一：Docker 部署（推荐）

### 1. 拉取镜像

```bash
docker pull vinlic/deepseek-free-api:latest
```

### 2. 启动容器

```bash
docker run -d \
  --name deepseek-api \
  -p 8000:8000 \
  -e TZ=Asia/Shanghai \
  -e DEEP_SEEK_CHAT_AUTHORIZATION=你的token \
  vinlic/deepseek-free-api:latest
```

### 3. 验证服务

```bash
curl http://localhost:8000/ping
# 响应: pong
```

## 方式二：Docker Compose

### 1. 创建配置文件

```yaml
# docker-compose.yml
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
      - DEEP_SEEK_CHAT_AUTHORIZATION=你的token
```

### 2. 启动服务

```bash
docker-compose up -d
```

## 方式三：Vercel 部署

### 1. 安装 Vercel CLI

```bash
npm i -g vercel
```

### 2. 克隆项目

```bash
git clone https://github.com/LLM-Red-Team/deepseek-free-api
cd deepseek-free-api
```

### 3. 部署

```bash
vercel login
vercel --prod
```

### 4. 配置环境变量

在 Vercel 控制台设置环境变量：
- `DEEP_SEEK_CHAT_AUTHORIZATION`: 你的 Token

## 方式四：原生部署

### 1. 克隆项目

```bash
git clone https://github.com/LLM-Red-Team/deepseek-free-api
cd deepseek-free-api
```

### 2. 安装依赖

```bash
npm install
```

### 3. 构建项目

```bash
npm run build
```

### 4. 配置环境变量

```bash
# 创建 .env 文件
echo "DEEP_SEEK_CHAT_AUTHORIZATION=你的token" > .env
```

### 5. 启动服务

```bash
npm start
```

或使用 PM2 守护进程：

```bash
npm i -g pm2
pm2 start dist/index.js --name deepseek-api
```

## 第一个请求

### 使用 cURL

```bash
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 你的token" \
  -d '{
    "model": "deepseek-chat",
    "messages": [
      {"role": "user", "content": "你好，请介绍一下你自己"}
    ]
  }'
```

### 使用 Python

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:8000/v1",
    api_key="your-token"  # 可以是任意值
)

response = client.chat.completions.create(
    model="deepseek-chat",
    messages=[
        {"role": "user", "content": "你好！"}
    ]
)

print(response.choices[0].message.content)
```

### 使用 JavaScript

```javascript
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'http://localhost:8000/v1',
  apiKey: 'your-token'
});

const response = await client.chat.completions.create({
  model: 'deepseek-chat',
  messages: [{ role: 'user', content: '你好！' }]
});

console.log(response.choices[0].message.content);
```

### 流式响应示例

```javascript
const stream = await client.chat.completions.create({
  model: 'deepseek-chat',
  messages: [{ role: 'user', content: '写一首关于春天的诗' }],
  stream: true
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
```

## 验证安装

### 1. 检查服务状态

```bash
curl http://localhost:8000/ping
# 响应: pong
```

### 2. 检查模型列表

```bash
curl http://localhost:8000/v1/models
```

### 3. 检查 Token 状态

```bash
curl -X POST http://localhost:8000/token/check \
  -H "Content-Type: application/json" \
  -d '{"token": "你的token"}'
# 响应: {"live": true}
```

## 常见问题

### Q: 服务启动失败？

检查端口是否被占用：
```bash
# Linux/Mac
lsof -i :8000

# Windows
netstat -ano | findstr :8000
```

### Q: 请求超时？

可能是网络问题，尝试：
1. 检查网络连接
2. 增加超时时间
3. 更换部署区域

### Q: Token 无效？

1. 确认 Token 是否正确复制
2. 检查 Token 是否过期
3. 尝试重新获取 Token

## 下一步

- [API 接口文档](./03-api-reference.md) - 了解完整的 API 接口
- [模型说明](./04-models.md) - 了解支持的所有模型
- [部署指南](./05-deployment.md) - 深入了解各种部署方式

---

上一章：[项目概述](./01-overview.md) | 下一章：[API 接口文档](./03-api-reference.md)
