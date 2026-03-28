# Web 前端文档

## 概述

DeepSeek Free API Web 是一个现代化的前端展示网站，提供项目介绍、API 文档、在线演示等功能。

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| HTML5 | - | 页面结构 |
| CSS3 | - | 样式设计 |
| JavaScript (ES6+) | - | 交互逻辑 |
| Google Fonts | - | 字体资源 |

## 文件结构

```
web/
├── index.html    # 主页面
├── styles.css    # 样式文件
└── app.js        # 交互脚本
```

## 功能模块

### 1. 主题切换

支持明暗主题切换，自动保存用户偏好。

```javascript
// 切换主题
ThemeManager.toggle();

// 获取当前主题
const theme = document.documentElement.getAttribute('data-theme');
```

### 2. 响应式导航

- 桌面端：水平导航栏
- 移动端：汉堡菜单

### 3. 在线聊天演示

完整的聊天界面，支持：
- 流式/非流式响应
- 多模型切换
- 实时对话

```javascript
// 初始化聊天
ChatDemo.init();

// 发送消息
ChatDemo.sendMessage();
```

### 4. 文档标签页

API 文档的标签切换功能。

### 5. 代码复制

一键复制代码示例。

## 样式系统

### CSS 变量

```css
/* 颜色 */
--primary: #6366f1;
--secondary: #ec4899;
--accent: #06b6d4;

/* 背景 */
--bg-primary: #ffffff;
--bg-secondary: #f8fafc;

/* 文字 */
--text-primary: #0f172a;
--text-secondary: #475569;

/* 边框 */
--border-light: #e2e8f0;

/* 圆角 */
--radius-md: 10px;
--radius-lg: 16px;
```

### 暗色主题

```css
[data-theme="dark"] {
    --bg-primary: #0f172a;
    --bg-secondary: #1e293b;
    --text-primary: #f8fafc;
}
```

### 响应式断点

| 断点 | 宽度 | 用途 |
|------|------|------|
| Desktop | > 1024px | 完整布局 |
| Tablet | 768px - 1024px | 两列布局 |
| Mobile | < 768px | 单列布局 |

## 组件说明

### 导航栏 (Navbar)

固定在顶部，滚动时添加阴影效果。

```html
<nav class="navbar" id="navbar">
    <!-- 导航内容 -->
</nav>
```

### 英雄区域 (Hero)

全屏展示区域，包含粒子动画背景。

```html
<section class="hero" id="hero">
    <!-- 内容 -->
</section>
```

### 功能卡片 (Feature Cards)

```html
<div class="feature-card">
    <div class="feature-icon"><!-- SVG --></div>
    <h3 class="feature-title">标题</h3>
    <p class="feature-description">描述</p>
</div>
```

### 模型表格 (Models Table)

```html
<table class="models-table">
    <thead><!-- 表头 --></thead>
    <tbody><!-- 表体 --></tbody>
</table>
```

### 聊天演示 (Chat Demo)

```html
<div class="demo-container">
    <div class="demo-sidebar"><!-- 配置 --></div>
    <div class="demo-main">
        <div class="chat-container"><!-- 消息 --></div>
        <div class="chat-input-container"><!-- 输入 --></div>
    </div>
</div>
```

## API 集成

### 配置

```javascript
// 设置 API 端点
document.getElementById('apiEndpoint').value = 'http://localhost:8000/v1';

// 设置 Token
document.getElementById('apiToken').value = 'your-token';

// 选择模型
document.getElementById('modelSelect').value = 'deepseek-chat';
```

### 发送请求

```javascript
// 非流式请求
const response = await fetch(`${endpoint}/chat/completions`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
        model: model,
        messages: messages,
        stream: false
    })
});

// 流式请求
const response = await fetch(`${endpoint}/chat/completions`, {
    // ...
    body: JSON.stringify({
        model: model,
        messages: messages,
        stream: true
    })
});

const reader = response.body.getReader();
// 读取流...
```

## 自定义指南

### 修改主题色

编辑 `styles.css` 中的 CSS 变量：

```css
:root {
    --primary: #你的颜色;
    --primary-dark: #你的深色;
    --primary-light: #你的浅色;
}
```

### 添加新模型

编辑 `index.html` 中的模型选择器：

```html
<select id="modelSelect">
    <option value="new-model">新模型名称</option>
</select>
```

### 修改内容

直接编辑 `index.html` 文件中的文本内容。

## 部署方式

### 静态托管

可直接部署到任何静态托管服务：

- GitHub Pages
- Vercel
- Netlify
- Cloudflare Pages

### 本地运行

```bash
# 进入 web 目录
cd web

# 启动简单服务器
python -m http.server 8080
# 或
npx serve
```

## 浏览器支持

| 浏览器 | 版本 |
|--------|------|
| Chrome | 80+ |
| Firefox | 75+ |
| Safari | 13+ |
| Edge | 80+ |

## 性能优化

1. **字体优化**：使用 Google Fonts 的 `display=swap`
2. **CSS 优化**：使用 CSS 变量减少重复
3. **动画优化**：使用 `transform` 和 `opacity` 触发 GPU 加速
4. **图片优化**：使用 SVG 图标

## 无障碍支持

- 语义化 HTML 标签
- ARIA 标签
- 键盘导航支持
- 颜色对比度符合 WCAG 标准

## 后续计划

- [ ] 添加更多动画效果
- [ ] 支持多语言
- [ ] 添加使用统计
- [ ] 集成更多演示功能

---

*最后更新: 2024-01-15*
