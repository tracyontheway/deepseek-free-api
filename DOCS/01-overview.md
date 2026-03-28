# 项目概述

## 什么是 DeepSeek Free API？

DeepSeek Free API 是一个开源项目，它将 DeepSeek Chat 的 Web 接口转换为标准的 OpenAI 兼容 API 格式，使得用户可以直接使用 OpenAI SDK 或其他兼容 OpenAI API 的客户端来调用 DeepSeek 的 AI 服务。

## 核心特性

### 1. OpenAI 接口兼容

完全兼容 OpenAI Chat Completions API，可以无缝切换：

```javascript
// 使用 OpenAI SDK
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'http://localhost:8000/v1',
  apiKey: 'your-deepseek-token'
});

const response = await client.chat.completions.create({
  model: 'deepseek-chat',
  messages: [{ role: 'user', content: '你好!' }]
});
```

### 2. 高速流式输出

支持 Server-Sent Events (SSE) 流式响应，实现打字机效果的实时输出：

```javascript
const stream = await client.chat.completions.create({
  model: 'deepseek-chat',
  messages: [{ role: 'user', content: '写一首诗' }],
  stream: true
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
```

### 3. 多种模型支持

| 模型 | 功能 |
|------|------|
| `deepseek-chat` | 标准对话模型 |
| `deepseek-think` | 深度思考模型 (R1) |
| `deepseek-search` | 联网搜索模型 |
| `deepseek-r1-search` | 深度思考 + 联网搜索 |
| `deepseek-think-fold` | 折叠思考过程 |

### 4. 多轮对话

支持原生多轮对话，通过 `conversation_id` 保持上下文：

```javascript
// 第一轮对话
const response1 = await client.chat.completions.create({
  model: 'deepseek-chat',
  messages: [{ role: 'user', content: '我叫小明' }]
});

// 第二轮对话，保持上下文
const response2 = await client.chat.completions.create({
  model: 'deepseek-chat',
  messages: [{ role: 'user', content: '我叫什么名字？' }],
  conversation_id: response1.id  // 传入上一轮的 ID
});
```

### 5. 多 Token 支持

支持配置多个 DeepSeek Token，自动负载均衡：

```bash
# 环境变量配置多个 Token
DEEP_SEEK_CHAT_AUTHORIZATION=token1,token2,token3
```

## 项目架构

```
deepseek-free-api/
├── src/
│   ├── index.ts           # 入口文件
│   ├── api/
│   │   ├── controllers/   # 控制器
│   │   ├── routes/        # 路由定义
│   │   └── consts/        # 常量
│   ├── lib/
│   │   ├── server.ts      # Koa 服务器
│   │   ├── config.ts      # 配置管理
│   │   ├── logger.ts      # 日志系统
│   │   └── ...
│   └── workers/           # Worker 线程
├── public/                # 静态文件
├── configs/               # 配置文件
└── dist/                  # 构建输出
```

## 技术原理

### 1. 逆向工程

项目通过逆向分析 DeepSeek Chat 的 Web 接口，模拟浏览器行为：

- 模拟浏览器 Headers
- 实现 Challenge 响应算法
- 处理 Cookie 和 Session

### 2. 流式转换

将 DeepSeek 的 SSE 流转换为 OpenAI 格式：

```
DeepSeek 格式                    OpenAI 格式
┌─────────────────┐             ┌─────────────────┐
│ {"choices":[{   │             │ {"choices":[{   │
│   "delta":{     │   ───────►  │   "delta":{     │
│     "content":"xx"│           │     "content":"xx"│
│   }             │             │   }             │
│ }]}             │             │ }]}             │
└─────────────────┘             └─────────────────┘
```

### 3. Challenge 应答机制

DeepSeek 使用 PoW (Proof of Work) Challenge 防止滥用：

1. 服务器请求 Challenge
2. 本地计算 Hash 答案 (WASM)
3. 提交答案获取访问权限

## 使用场景

### 1. 个人 AI 助手

搭建私人 AI 助手，支持对话、搜索、思考等多种模式。

### 2. 应用开发集成

集成到自己的应用中，利用 OpenAI SDK 快速开发。

### 3. 研究学习

学习逆向工程、API 设计、流式处理等技术。

### 4. 成本优化

在测试阶段使用 Free API 降低成本，生产环境切换官方 API。

## 限制与注意事项

1. **仅供个人使用** - 禁止对外提供服务
2. **Token 限制** - 单账号同时只能有一路输出
3. **稳定性** - 逆向接口可能随时失效
4. **配额限制** - 深度思考有配额限制
5. **合规风险** - 可能违反用户协议

## 推荐替代方案

对于生产环境，推荐使用：

- [DeepSeek 官方 API](https://platform.deepseek.com/)
- [OpenAI API](https://platform.openai.com/)
- [Azure OpenAI](https://azure.microsoft.com/en-us/products/cognitive-services/openai-service)

---

下一章：[快速开始](./02-quick-start.md)
