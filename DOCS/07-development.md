# 开发指南

本文档面向开发者，介绍如何进行本地开发、测试和贡献代码。

## 开发环境设置

### 前提条件

- Node.js 18+
- npm 或 yarn
- Git
- VS Code (推荐)

### 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/LLM-Red-Team/deepseek-free-api
cd deepseek-free-api

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，添加你的 Token
```

### 开发模式

```bash
# 启动开发服务器（热重载）
npm run dev
```

开发模式会：
- 监听文件变化自动重新编译
- 自动重启服务
- 启用 Source Map 调试

---

## 项目结构

```
deepseek-free-api/
├── src/
│   ├── index.ts              # 应用入口
│   ├── daemon.ts             # 守护进程
│   ├── api/
│   │   ├── consts/
│   │   │   └── exceptions.ts # 异常常量
│   │   ├── controllers/
│   │   │   └── chat.ts       # 聊天控制器
│   │   └── routes/
│   │       ├── index.ts      # 路由注册
│   │       ├── chat.ts       # 聊天路由
│   │       ├── models.ts     # 模型路由
│   │       ├── ping.ts       # 健康检查
│   │       └── token.ts      # Token 验证
│   ├── lib/
│   │   ├── server.ts         # Koa 服务器
│   │   ├── config.ts         # 配置加载
│   │   ├── environment.ts    # 环境变量
│   │   ├── logger.ts         # 日志系统
│   │   ├── challenge.ts      # Challenge 处理
│   │   ├── util.ts           # 工具函数
│   │   ├── configs/
│   │   │   ├── service-config.ts
│   │   │   └── system-config.ts
│   │   ├── consts/
│   │   │   └── exceptions.ts
│   │   ├── exceptions/
│   │   │   ├── APIException.ts
│   │   │   └── Exception.ts
│   │   ├── interfaces/
│   │   │   └── ICompletionMessage.ts
│   │   ├── request/
│   │   │   └── Request.ts
│   │   └── response/
│   │       ├── Body.ts
│   │       ├── FailureBody.ts
│   │       ├── Response.ts
│   │       └── SuccessfulBody.ts
│   └── workers/
│       └── challengeWorker.ts
├── public/
│   └── welcome.html          # 欢迎页面
├── configs/
│   └── dev/
│       ├── service.yml       # 服务配置
│       └── system.yml        # 系统配置
├── api/
│   └── index.ts              # Vercel 入口
├── DOCS/                     # 文档目录
├── dist/                     # 构建输出
└── tests/                    # 测试文件
```

---

## 核心模块说明

### 1. 服务器模块 (lib/server.ts)

Koa 服务器封装，处理：
- CORS 跨域
- 请求体解析
- 路由注册
- 错误处理
- 日志记录

```typescript
// 使用示例
import server from '@/lib/server.ts';
import routes from '@/api/routes/index.ts';

server.attachRoutes(routes);
await server.listen();
```

### 2. 路由模块 (api/routes/)

定义 API 路由：

```typescript
// routes/chat.ts
export default {
  prefix: '/v1/chat',
  post: {
    '/completions': async (request: Request) => {
      // 处理逻辑
    }
  }
}
```

### 3. 控制器模块 (api/controllers/)

业务逻辑处理：

```typescript
// controllers/chat.ts
export async function createCompletion(
  model: string,
  messages: any[],
  refreshToken: string
) {
  // 1. 获取 Token
  // 2. 创建会话
  // 3. 发送请求
  // 4. 处理响应
}
```

### 4. Challenge 模块 (lib/challenge.ts)

处理 DeepSeek 的 PoW Challenge：

```typescript
import { DeepSeekHash } from '@/lib/challenge.ts';

const hash = new DeepSeekHash();
await hash.init('./sha3_wasm_bg.wasm');
const answer = hash.calculateHash(algorithm, challenge, salt, difficulty);
```

---

## 开发流程

### 1. 创建新功能

```bash
# 创建功能分支
git checkout -b feature/new-feature

# 开发...
npm run dev

# 测试
npm test

# 提交
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature
```

### 2. 修复 Bug

```bash
# 创建修复分支
git checkout -b fix/bug-name

# 修复...
npm run dev

# 测试
npm test

# 提交
git add .
git commit -m "fix: fix bug description"
git push origin fix/bug-name
```

---

## 测试

### 运行测试

```bash
# 运行所有测试
npm test

# 运行特定测试
npm test -- --grep "API Server"

# 生成覆盖率报告
npm run test:coverage
```

### 测试结构

```typescript
// src/__tests__/api.test.ts
describe('API Server', () => {
  describe('POST /v1/chat/completions', () => {
    it('should return chat completion', async () => {
      const response = await request(app.callback())
        .post('/v1/chat/completions')
        .set('Authorization', 'Bearer token')
        .send({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: 'Hello' }]
        })
        .expect(200);

      expect(response.body).toHaveProperty('choices');
    });
  });
});
```

### 测试最佳实践

1. **隔离测试** - 每个测试应该独立运行
2. **Mock 外部依赖** - 不要在测试中调用真实 API
3. **测试边界情况** - 测试错误处理和异常情况
4. **清晰的断言** - 使用描述性的断言消息

---

## 构建与打包

### 开发构建

```bash
npm run build
```

### 构建输出

```
dist/
├── index.js       # ESM 格式
├── index.cjs      # CommonJS 格式
├── index.d.ts     # 类型声明
└── *.map          # Source Maps
```

### 构建配置 (tsup)

```typescript
// 隐式配置在 package.json scripts 中
tsup src/index.ts \
  --format cjs,esm \
  --sourcemap \
  --dts \
  --clean \
  --publicDir public
```

---

## 代码规范

### TypeScript 规范

```typescript
// 使用类型导入
import type { Request } from '@/lib/request/Request.ts';

// 使用接口定义类型
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// 使用 const 断言
const MODELS = ['deepseek-chat', 'deepseek-think'] as const;

// 使用可选链
const content = response?.choices?.[0]?.message?.content;
```

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 文件名 | kebab-case | `chat-controller.ts` |
| 类名 | PascalCase | `APIException` |
| 函数名 | camelCase | `createCompletion` |
| 常量 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| 私有方法 | #前缀 | `#requestProcessing` |

---

## 调试技巧

### VS Code 调试配置

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "console": "integratedTerminal"
    }
  ]
}
```

### 日志调试

```typescript
import logger from '@/lib/logger.ts';

logger.debug('调试信息', data);
logger.info('一般信息');
logger.warn('警告信息');
logger.error('错误信息', error);
```

### 请求调试

```bash
# 使用 curl 调试
curl -v http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token" \
  -d '{"model": "deepseek-chat", "messages": [...]}'
```

---

## 贡献指南

### 提交规范

使用 Conventional Commits：

```
feat: 添加新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建/工具链更新
```

### PR 流程

1. Fork 项目
2. 创建功能分支
3. 编写代码和测试
4. 提交 PR
5. 等待代码审查

---

上一章：[配置说明](./06-configuration.md) | 下一章：[常见问题](./08-faq.md)
