# 常见问题 (FAQ)

## 安装与部署

### Q: Node.js 版本要求？

**A**: 需要 Node.js 18.0 或更高版本。推荐使用 LTS 版本。

```bash
# 检查 Node.js 版本
node --version

# 推荐使用 nvm 管理 Node.js 版本
nvm install 18
nvm use 18
```

### Q: npm install 报错怎么办？

**A**: 尝试以下解决方案：

```bash
# 清除 npm 缓存
npm cache clean --force

# 删除 node_modules 重新安装
rm -rf node_modules package-lock.json
npm install

# 使用国内镜像
npm install --registry=https://registry.npmmirror.com
```

### Q: Docker 镜像拉取失败？

**A**: 使用国内镜像源：

```bash
# 配置 Docker 镜像源
# 编辑 /etc/docker/daemon.json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com"
  ]
}

# 重启 Docker
sudo systemctl restart docker
```

### Q: 端口被占用怎么办？

**A**: 更改端口或终止占用进程：

```bash
# Linux/Mac 查看端口占用
lsof -i :8000
kill -9 <PID>

# Windows 查看端口占用
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# 或使用其他端口
PORT=8001 npm start
```

---

## Token 相关

### Q: 如何获取 DeepSeek Token？

**A**: 参见 [快速开始](./02-quick-start.md#获取-deepseek-token)

1. 登录 [DeepSeek Chat](https://chat.deepseek.com/)
2. 打开浏览器开发者工具 (F12)
3. Application → Local Storage → `userToken`
4. 复制 Value 值

### Q: Token 无效怎么办？

**A**: 可能原因和解决方案：

| 原因 | 解决方案 |
|------|---------|
| Token 复制不完整 | 重新复制完整 Token |
| Token 已过期 | 重新登录获取新 Token |
| 账号被限制 | 检查账号状态，联系官方 |
| 格式错误 | 确保没有多余空格或换行 |

### Q: 多个 Token 如何配置？

**A**: 使用逗号分隔：

```bash
DEEP_SEEK_CHAT_AUTHORIZATION=token1,token2,token3
```

服务会自动轮询使用。

### Q: Token 配额用完了？

**A**: 深度思考模型有每日配额限制：

1. 等待配额重置（每日重置）
2. 使用普通对话模型
3. 切换到其他 Token
4. 考虑使用官方付费 API

---

## API 使用

### Q: 请求超时怎么办？

**A**: 调整超时配置：

```javascript
// 客户端设置超时
const client = new OpenAI({
  baseURL: 'http://localhost:8000/v1',
  apiKey: 'token',
  timeout: 120000  // 2 分钟
});
```

### Q: 流式响应不完整？

**A**: 检查以下几点：

1. **Nginx 配置** - 确保关闭 proxy buffering
2. **客户端处理** - 正确读取 SSE 流
3. **网络连接** - 检查连接稳定性

```nginx
# Nginx 配置
proxy_buffering off;
chunked_transfer_encoding on;
```

### Q: 如何实现多轮对话？

**A**: 两种方式：

```javascript
// 方式一：传递完整消息列表
const response = await client.chat.completions.create({
  model: 'deepseek-chat',
  messages: [
    { role: 'user', content: '你好' },
    { role: 'assistant', content: '你好！' },
    { role: 'user', content: '继续' }
  ]
});

// 方式二：使用 conversation_id
const response2 = await client.chat.completions.create({
  model: 'deepseek-chat',
  messages: [{ role: 'user', content: '继续' }],
  conversation_id: response1.id
});
```

### Q: 返回 401 Unauthorized？

**A**: 检查：

1. Token 是否正确设置
2. Authorization 头格式是否正确
3. Token 是否过期

```bash
# 正确格式
Authorization: Bearer your-token
```

---

## 部署问题

### Q: Vercel 部署 504 超时？

**A**: Vercel 免费版请求超时 10 秒：

1. 升级到 Vercel Pro
2. 使用其他部署平台（Render、Docker）
3. 优化请求响应时间

### Q: Render 服务休眠？

**A**: 免费版 15 分钟无活动后休眠：

1. 使用保活服务（cron-job.org）
2. 升级到付费版
3. 自建服务器

```bash
# 保活脚本
*/10 * * * * curl https://your-app.onrender.com/ping
```

### Q: Docker 容器无法访问？

**A**: 检查：

1. 端口映射是否正确
2. 防火墙是否开放端口
3. 容器是否正常运行

```bash
# 检查容器状态
docker ps
docker logs deepseek-api

# 检查端口
docker port deepseek-api
```

---

## 功能相关

### Q: 支持哪些模型？

**A**: 参见 [模型说明](./04-models.md)

主要模型：
- `deepseek-chat` - 标准对话
- `deepseek-think` - 深度思考
- `deepseek-search` - 联网搜索
- `deepseek-r1-search` - 思考+搜索

### Q: 深度思考和联网搜索能同时用吗？

**A**: 可以使用复合模型：

```javascript
// 深度思考 + 联网搜索
const response = await client.chat.completions.create({
  model: 'deepseek-r1-search',
  messages: [{ role: 'user', content: '分析最新 AI 趋势' }]
});
```

### Q: 如何隐藏思考过程？

**A**: 使用静默模型：

```javascript
const response = await client.chat.completions.create({
  model: 'deepseek-r1-silent',  // 静默思考
  messages: [{ role: 'user', content: '分析这个问题' }]
});
```

### Q: 支持 function calling 吗？

**A**: 目前不支持。如需此功能，建议使用官方 API。

### Q: 支持图片输入吗？

**A**: 目前不支持多模态输入。仅支持文本对话。

---

## 性能与稳定性

### Q: 并发请求支持吗？

**A**: 单 Token 同时只能有一路输出。建议：

1. 配置多个 Token
2. 使用负载均衡
3. 添加请求队列

### Q: 如何提高响应速度？

**A**: 优化建议：

1. 使用离用户近的服务器
2. 优化网络连接
3. 使用非思考模型（更快）
4. 启用流式响应

### Q: 服务不稳定怎么办？

**A**: 可能原因：

1. DeepSeek 官方接口变动
2. Token 被限制
3. 网络问题

解决方案：
1. 关注项目更新
2. 定期检查 Token 状态
3. 配置多个 Token 和重试机制

---

## 安全相关

### Q: Token 会被泄露吗？

**A**: 保护措施：

1. 不要公开部署服务
2. 使用 HTTPS
3. 设置访问控制
4. 不要在代码中硬编码 Token

### Q: 可以公开提供服务吗？

**A**: **不可以**。本项目仅供个人学习使用，公开提供服务可能违反 DeepSeek 用户协议。

### Q: 如何添加访问认证？

**A**: 使用 Nginx 或中间件：

```nginx
# Nginx Basic Auth
location / {
    auth_basic "Restricted";
    auth_basic_user_file /etc/nginx/.htpasswd;
    proxy_pass http://127.0.0.1:8000;
}
```

---

## 其他问题

### Q: 与官方 API 有什么区别？

**A**:

| 对比项 | Free API | 官方 API |
|--------|----------|----------|
| 费用 | 免费 | 按使用付费 |
| 稳定性 | 较低 | 高 |
| 功能 | 基础功能 | 完整功能 |
| 配额 | 有限制 | 按付费 |
| 支持 | 无官方支持 | 官方支持 |

### Q: 遇到其他问题怎么办？

**A**:

1. 查看本文档
2. 搜索 [Issues](https://github.com/LLM-Red-Team/deepseek-free-api/issues)
3. 提交新 Issue（附带日志和复现步骤）

---

上一章：[开发指南](./07-development.md) | 下一章：[更新日志](./09-changelog.md)
