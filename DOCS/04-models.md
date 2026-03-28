# 模型说明

DeepSeek Free API 支持多种模型，每种模型针对不同的使用场景进行了优化。

## 模型概览

| 模型名称 | 功能 | 思考过程 | 联网搜索 |
|---------|------|---------|---------|
| `deepseek-chat` | 标准对话 | ❌ | ❌ |
| `deepseek-coder` | 代码生成 | ❌ | ❌ |
| `deepseek-think` | 深度思考 | ✅ 显示 | ❌ |
| `deepseek-r1` | 深度思考 (R1) | ✅ 显示 | ❌ |
| `deepseek-search` | 联网搜索 | ❌ | ✅ |
| `deepseek-r1-search` | 深度思考+搜索 | ✅ 显示 | ✅ |
| `deepseek-think-search` | 深度思考+搜索 | ✅ 显示 | ✅ |
| `deepseek-r1-silent` | 静默思考 | ❌ 隐藏 | ❌ |
| `deepseek-think-silent` | 静默思考 | ❌ 隐藏 | ❌ |
| `deepseek-search-silent` | 静默搜索 | ❌ 隐藏 | ✅ |
| `deepseek-think-fold` | 折叠思考 | ✅ 折叠 | ❌ |
| `deepseek-r1-fold` | 折叠思考 (R1) | ✅ 折叠 | ❌ |

---

## 详细说明

### 1. deepseek-chat

标准对话模型，适用于日常对话、问答、写作等通用场景。

**特点**
- 响应速度快
- 适合日常对话
- 无额外功能开销

**示例**
```javascript
const response = await client.chat.completions.create({
  model: 'deepseek-chat',
  messages: [{ role: 'user', content: '你好，请介绍一下自己' }]
});
```

**适用场景**
- 日常聊天对话
- 简单问答
- 文本生成
- 信息查询

---

### 2. deepseek-coder

代码专用模型，针对编程任务进行了优化。

**特点**
- 代码生成质量高
- 支持多种编程语言
- 代码解释和优化

**示例**
```javascript
const response = await client.chat.completions.create({
  model: 'deepseek-coder',
  messages: [{ 
    role: 'user', 
    content: '用 Python 写一个快速排序算法' 
  }]
});
```

**适用场景**
- 代码生成
- 代码解释
- Bug 修复
- 代码优化

---

### 3. deepseek-think / deepseek-r1

深度思考模型，在回答前会进行深入分析和推理。

**特点**
- 显示完整思考过程
- 逻辑推理能力强
- 适合复杂问题分析

**示例**
```javascript
const response = await client.chat.completions.create({
  model: 'deepseek-think',
  messages: [{ 
    role: 'user', 
    content: '请分析人工智能对未来就业市场的影响' 
  }]
});
```

**响应格式**

思考过程会包含在响应中：

```json
{
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "[思考开始]\n首先，我需要分析...\n[思考结束]\n\n基于以上分析，我认为...",
      "reasoning_content": "完整的思考过程..."
    }
  }]
}
```

**适用场景**
- 复杂问题分析
- 逻辑推理
- 决策建议
- 学术研究

**注意**: 深度思考模型有每日配额限制，请合理使用。

---

### 4. deepseek-search

联网搜索模型，可以实时搜索互联网获取最新信息。

**特点**
- 实时联网搜索
- 获取最新信息
- 提供信息来源

**示例**
```javascript
const response = await client.chat.completions.create({
  model: 'deepseek-search',
  messages: [{ 
    role: 'user', 
    content: '今天的热点新闻有哪些？' 
  }]
});
```

**响应格式**

搜索结果会显示来源：

```
根据搜索结果，今天的热点新闻包括：

1. [新闻标题1]
   来源：xxx.com

2. [新闻标题2]
   来源：xxx.com

搜索结果来自：
- 标题1 - https://xxx.com
- 标题2 - https://xxx.com
```

**适用场景**
- 实时新闻查询
- 最新信息获取
- 数据查询
- 事实核查

---

### 5. deepseek-r1-search / deepseek-think-search

结合深度思考和联网搜索的复合模型。

**特点**
- 先搜索，后思考
- 综合分析能力强
- 提供全面回答

**示例**
```javascript
const response = await client.chat.completions.create({
  model: 'deepseek-r1-search',
  messages: [{ 
    role: 'user', 
    content: '请分析最新的 AI 技术发展趋势' 
  }]
});
```

**适用场景**
- 深度研究
- 趋势分析
- 综合报告
- 复杂决策

---

### 6. deepseek-r1-silent / deepseek-think-silent

静默思考模型，进行深度思考但不显示思考过程。

**特点**
- 深度思考能力
- 不显示思考过程
- 响应更简洁

**示例**
```javascript
const response = await client.chat.completions.create({
  model: 'deepseek-r1-silent',
  messages: [{ 
    role: 'user', 
    content: '请分析这个复杂问题' 
  }]
});
```

**适用场景**
- 需要深度分析但不需要看过程
- 简洁回复需求
- 专业场景

---

### 7. deepseek-think-fold / deepseek-r1-fold

折叠思考模型，思考过程以折叠形式显示。

**特点**
- 思考过程可折叠
- 需要前端支持
- 整洁的展示方式

**示例**
```javascript
const response = await client.chat.completions.create({
  model: 'deepseek-think-fold',
  messages: [{ 
    role: 'user', 
    content: '请详细分析这个问题' 
  }]
});
```

**响应格式**

思考过程使用 HTML 折叠标签：

```html
<details>
<summary>思考过程</summary>
<pre>
这是完整的思考过程...
</pre>
</details>

基于以上分析，我的回答是...
```

**适用场景**
- Web 界面展示
- 需要整洁显示
- 用户可选查看

---

## 模型选择指南

### 按场景选择

| 场景 | 推荐模型 |
|------|---------|
| 日常聊天 | `deepseek-chat` |
| 编程开发 | `deepseek-coder` |
| 复杂问题分析 | `deepseek-think` |
| 实时信息查询 | `deepseek-search` |
| 深度研究 | `deepseek-r1-search` |
| 简洁回复 | `deepseek-r1-silent` |
| Web 展示 | `deepseek-think-fold` |

### 按需求选择

| 需求 | 推荐模型 |
|------|---------|
| 快速响应 | `deepseek-chat` |
| 深度分析 | `deepseek-think` |
| 最新信息 | `deepseek-search` |
| 代码生成 | `deepseek-coder` |
| 专业报告 | `deepseek-r1-search` |

---

## Token 消耗说明

| 模型类型 | Token 消耗 |
|---------|-----------|
| 基础模型 | 标准 |
| 思考模型 | 较高（包含思考过程） |
| 搜索模型 | 较高（包含搜索结果） |
| 复合模型 | 最高 |

**注意**:
- 返回的 token 统计为固定值，不代表实际消耗
- 深度思考模型有每日配额限制

---

## 自定义模型名称

你也可以在消息内容中指定功能：

```javascript
// 在消息中指定深度思考
const response = await client.chat.completions.create({
  model: 'deepseek-chat',
  messages: [{ 
    role: 'user', 
    content: '[深度思考] 请分析这个问题' 
  }]
});

// 在消息中指定联网搜索
const response = await client.chat.completions.create({
  model: 'deepseek-chat',
  messages: [{ 
    role: 'user', 
    content: '[联网搜索] 今天天气如何？' 
  }]
});
```

---

上一章：[API 接口文档](./03-api-reference.md) | 下一章：[部署指南](./05-deployment.md)
