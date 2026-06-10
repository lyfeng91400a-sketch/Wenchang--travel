# 文昌文旅助手

海南文昌文旅专属 AI 问答与伴游平台，由「航小昌」为您提供智能行程规划、景点推荐与咨询服务。

## 功能特性

- **智能问答**：支持景点、美食、文化、行程等旅游相关咨询
- **快捷提问**：内置常见问题，一键发起对话
- **流式回复**：AI 回答实时输出，支持 Markdown 排版
- **本地知识库**：部分高频问题内置预设答案，响应更快

## 技术栈

- 前端：React 19 + TypeScript + Vite + Tailwind CSS
- 后端：Express / Vercel Serverless
- AI：DeepSeek（生产环境优先）/ Google Gemini（开发环境）

## 本地运行

**环境要求：** Node.js 20+

```bash
cd app
npm install
```

复制环境变量并填入 API Key：

```bash
cp .env.example .env.local
```

在 `.env.local` 中配置以下任一密钥：

- `DEEPSEEK_API_KEY` — 生产环境推荐
- `GEMINI_API_KEY` — 本地开发可用

启动开发服务器：

```bash
npm run dev
```

浏览器访问 `http://localhost:5173`（端口以终端输出为准）。

## 部署

项目支持多种部署方式：

| 平台 | 说明 |
|------|------|
| GitHub Pages | 推送 `main` 分支自动构建静态站点 |
| Vercel | 使用 `vercel.json` 配置，支持 API 路由 |
| Render | 使用根目录 `render.yaml`，运行完整 Node 服务 |

生产环境请配置 `DEEPSEEK_API_KEY` 环境变量。

## 项目结构

```
Wenchang--travel/
├── app/                  # 应用源码
│   ├── src/              # React 前端
│   ├── api/              # Vercel Serverless API
│   ├── public/           # 静态资源（背景图、IP 形象等）
│   └── server.ts         # 本地开发服务器
├── .github/workflows/    # GitHub Pages 自动部署
└── render.yaml           # Render 部署配置
```

## 许可证

本项目为海南航天文旅内部使用，未经授权请勿对外传播。
