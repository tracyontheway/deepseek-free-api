# API 接口文档

本文档详细介绍 DeepSeek Free API 的所有接口。

## 基础信息

| 项目 | 说明 |
|------|------|
| 基础 URL | `http://your-host:8000` |
| 协议 | HTTP/1.1 |
| 数据格式 | JSON |
| 字符编码 | UTF-8 |

## 认证

所有需要认证的接口都需要在请求头中携带 Authorization：

```
Authorization: Bearer <your-deepseek-token>
```

> 也可以通过环境变量 `DEEP_SEEK_CHAT_AUTHORIZATION` 配置全局 Token。

---

## 接口列表

### 1. 对话补全

创建对话补全，与 OpenAI Chat Completions API 完全兼容。

**请求**

```
POST /v1/chat/completions
```

**请求头**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| Authorization | string | 是 | Bearer Token |
| Content-Type | string | 是 | application/json |

**请求体**

```json
{
  "model": "deepseek-chat",
  "messages": [
    {
      "role": "user",
      "content": "你好"
    }
  ],
  "stream": false,
  "conversation_id": "可选，用于多轮对话"
}
```

**参数说明**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| model | string | 是 | - | 模型名称，见 [模型说明](./04-models.md) |
| messages | array | 是 | - | 消息列表 |
| messages[].role | string | 是 | - | 角色：system/user/assistant |
| messages[].content | string | 是 | - | 消息内容 |
| stream | boolean | 否 | false | 是否流式响应 |
| conversation_id | string | 否 | - | 对话 ID，用于多轮对话 |

**响应（非流式）**

```json
{
  "id": "50207e56-747e-4800-9068-c6fd618374ee@2",
  "model": "deepseek-chat",
  "object": "chat.completion",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "你好！我是 DeepSeek..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 1,
    "completion_tokens": 1,
    "total_tokens": 2
  },
  "created": 1715061432
}
```

**响应（流式）**

流式响应使用 Server-Sent Events (SSE) 格式：

```
data: {"id":"xxx@1","model":"deepseek-chat","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"role":"assistant","content":"你"},"finish_reason":null}]}

data: {"id":"xxx@1","model":"deepseek-chat","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":"好"},"finish_reason":null}]}

data: {"id":"xxx@1","model":"deepseek-chat","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":""},"finish_reason":"stop"}]}

data: [DONE]
```

**请求示例**

```bash
# 非流式
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "你好"}]
  }'

# 流式
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "你好"}],
    "stream": true
  }'
```

---

### 2. 获取模型列表

获取所有可用模型列表。

**请求**

```
GET /v1/models
```

**响应**

```json
{
  "data": [
    {
      "id": "deepseek-chat",
      "object": "model",
      "owned_by": "deepseek-free-api"
    },
    {
      "id": "deepseek-think",
      "object": "model",
      "owned_by": "deepseek-free-api"
    }
    // ... 更多模型
  ]
}
```

**请求示例**

```bash
curl http://localhost:8000/v1/models
```

---

### 3. Token 状态检测

检测 Token 是否有效。

**请求**

```
POST /token/check
```

**请求体**

```json
{
  "token": "your-deepseek-token"
}
```

**响应**

```json
{
  "live": true
}
```

**请求示例**

```bash
curl -X POST http://localhost:8000/token/check \
  -H "Content-Type: application/json" \
  -d '{"token": "your-token"}'
```

> ⚠️ **注意**: 请勿频繁调用此接口（建议间隔 > 10 分钟）

---

### 4. 健康检查

检查服务是否正常运行。

**请求**

```
GET /ping
```

**响应**

```
pong
```

**请求示例**

```bash
curl http://localhost:8000/ping
```

---

## 错误响应

当请求出错时，返回如下格式的错误信息：

```json
{
  "success": false,
  "error": "错误描述",
  "code": "ERROR_CODE"
}
```

### 错误码说明

| 错误码 | HTTP 状态码 | 说明 |
|--------|-------------|------|
| UNAUTHORIZED | 401 | 未授权，Token 无效或缺失 |
| INVALID_REQUEST | 400 | 请求参数无效 |
| NOT_FOUND | 404 | 接口不存在 |
| API_REQUEST_FAILED | 500 | DeepSeek API 请求失败 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |

---

## 多轮对话

### 方式一：传递完整消息列表

```javascript
const response = await client.chat.completions.create({
  model: 'deepseek-chat',
  messages: [
    { role: 'user', content: '我叫小明' },
    { role: 'assistant', content: '你好小明！' },
    { role: 'user', content: '我叫什么名字？' }
  ]
});
```

### 方式二：使用 conversation_id

```javascript
// 第一轮
const response1 = await client.chat.completions.create({
  model: 'deepseek-chat',
  messages: [{ role: 'user', content: '我叫小明' }]
});

// 第二轮
const response2 = await client.chat.completions.create({
  model: 'deepseek-chat',
  messages: [{ role: 'user', content: '我叫什么名字？' }],
  conversation_id: response1.id  // 传入上一轮的 ID
});
```

---

## 流式响应处理

### JavaScript/TypeScript

```javascript
const stream = await client.chat.completions.create({
  model: 'deepseek-chat',
  messages: [{ role: 'user', content: '写一首诗' }],
  stream: true
});

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content || '';
  process.stdout.write(content);
}
```

### Python

```python
stream = client.chat.completions.create(
    model="deepseek-chat",
    messages=[{"role": "user", "content": "写一首诗"}],
    stream=True
)

for chunk in stream:
    content = chunk.choices[0].delta.content or ""
    print(content, end="", flush=True)
```

### cURL

```bash
curl -N http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "你好"}],
    "stream": true
  }'
```

---

## 特殊模型用法

### 深度思考模型

```javascript
// 显示思考过程
const response = await client.chat.completions.create({
  model: 'deepseek-think', // 或 'deepseek-r1'
  messages: [{ role: 'user', content: '请详细分析这个问题' }]
});

// 静默思考（不显示过程）
const response = await client.chat.completions.create({
  model: 'deepseek-r1-silent',
  messages: [{ role: 'user', content: '请详细分析这个问题' }]
});

// 折叠思考过程
const response = await client.chat.completions.create({
  model: 'deepseek-think-fold',
  messages: [{ role: 'user', content: '请详细分析这个问题' }]
});
```

### 联网搜索模型

```javascript
const response = await client.chat.completions.create({
  model: 'deepseek-search',
  messages: [{ role: 'user', content: '今天的新闻有哪些？' }]
});
```

### 深度思考 + 联网搜索

```javascript
const response = await client.chat.completions.create({
  model: 'deepseek-r1-search',
  messages: [{ role: 'user', content: '请搜索并分析最新的 AI 发展动态' }]
});
```

---

## 速率限制

- 单账号同时只能有一路输出
- 建议使用多个 Token 进行负载均衡
- 深度思考模型有每日配额限制

---

上一章：[快速开始](./02-quick-start.md) | 下一章：[模型说明](./04-models.md)
