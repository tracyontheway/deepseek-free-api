# 更新日志

本文档记录 DeepSeek Free API 的版本更新历史。

## 版本格式

遵循 [语义化版本](https://semver.org/lang/zh-CN/) 规范：

- `MAJOR.MINOR.PATCH`
- 主版本号.次版本号.修订号

---

## [0.0.20] - 2024-01-15

### 新增
- 支持 DeepSeek R1 深度思考模型
- 添加静默思考模式（不显示思考过程）
- 添加折叠思考模式（HTML 折叠标签）
- 支持深度思考 + 联网搜索组合
- 添加 Vercel 部署支持
- 添加完善的测试套件

### 改进
- 优化流式响应处理
- 改进多轮对话支持
- 提升 Token 管理效率
- 优化错误处理和日志

### 修复
- 修复 Challenge 响应计算问题
- 修复流式响应中断问题
- 修复多 Token 负载均衡问题

---

## [0.0.19] - 2024-01-10

### 新增
- 支持 DeepSeek V3 模型
- 添加联网搜索功能
- 支持 conversation_id 多轮对话

### 改进
- 优化请求重试机制
- 改进错误提示信息

### 修复
- 修复 Token 过期处理问题

---

## [0.0.18] - 2024-01-05

### 新增
- 支持 DeepSeek Coder 模型
- 添加 Docker 部署支持
- 添加健康检查接口

### 改进
- 优化构建配置
- 改进日志输出格式

---

## [0.0.17] - 2024-01-01

### 新增
- 初始版本发布
- 基础对话补全功能
- OpenAI API 兼容
- 流式响应支持
- 多 Token 支持

---

## 功能路线图

### 计划中
- [ ] Web 管理界面
- [ ] API Key 管理
- [ ] 使用统计面板
- [ ] 更多模型支持
- [ ] 图片理解支持

### 考虑中
- [ ] Function Calling 支持
- [ ] Embedding 接口
- [ ] 批量请求支持
- [ ] 自定义模型参数

---

## 贡献者

感谢所有贡献者的付出！

<!-- 贡献者列表将通过 GitHub Actions 自动生成 -->

---

## 版本升级指南

### 从 0.0.19 升级到 0.0.20

```bash
# 拉取最新代码
git pull

# 安装依赖
npm install

# 重新构建
npm run build

# 重启服务
pm2 restart deepseek-api
```

### Docker 升级

```bash
# 拉取最新镜像
docker pull vinlic/deepseek-free-api:latest

# 停止旧容器
docker stop deepseek-api
docker rm deepseek-api

# 启动新容器
docker run -d \
  --name deepseek-api \
  -p 8000:8000 \
  -e DEEP_SEEK_CHAT_AUTHORIZATION=your-token \
  vinlic/deepseek-free-api:latest
```

---

## 反馈与建议

如果您有任何问题或建议，欢迎：

1. 提交 [Issue](https://github.com/LLM-Red-Team/deepseek-free-api/issues)
2. 参与 [Discussions](https://github.com/LLM-Red-Team/deepseek-free-api/discussions)
3. 提交 Pull Request

---

*最后更新: 2024-01-15*
