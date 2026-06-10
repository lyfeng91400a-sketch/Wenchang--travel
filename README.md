# 文昌文旅助手

海南文昌文旅专属 AI 问答与伴游平台，由「航小昌」提供智能行程规划、景点推荐与咨询服务。

## 在线访问

| 名称 | 地址 | 说明 |
|------|------|------|
| 原型演示 | https://wenchang-travel-267871-7-1441387161.sh.run.tcloudbase.com/ | 腾讯云托管，支持 AI 对话完整功能 |
| 需求确认书 | https://lyfeng91400a-sketch.github.io/Wenchang--travel/requirement.html | 项目需求文档，含演示嵌入与 PDF 导出 |
| GitHub Pages | https://lyfeng91400a-sketch.github.io/Wenchang--travel/ | 静态预览（推送 main 自动部署） |

## 功能特性

- **智能问答**：景点、美食、文化、行程等旅游咨询
- **快捷提问**：内置常见问题，一键发起对话
- **流式回复**：AI 回答实时输出，支持 Markdown 排版
- **本地知识库**：高频问题内置预设答案，响应更快

## 目录说明

| 路径 | 作用 |
|------|------|
| `README.md` | 【文昌文旅项目说明】仓库首页文档，项目介绍与访问入口 |
| `app/` | 【应用源码】React 前端 + API 服务完整代码 |
| `app/src/` | 【前端页面】聊天界面、快捷提问、消息流式展示 |
| `app/api/` | 【AI 接口】Vercel Serverless 对话 API（DeepSeek / Gemini） |
| `app/public/` | 【静态资源】背景图、IP 形象、需求确认书页面 |
| `app/public/requirement.html` | 【需求确认书】在线需求文档，支持演示嵌入与 PDF 下载 |
| `app/server.ts` | 【本地服务】开发环境 Express 服务器 |
| `.github/workflows/` | 【自动部署】推送 main 分支后构建并发布 GitHub Pages |
| `render.yaml` | 【Render 部署】云端 Node 服务部署配置 |

## 技术栈

- 前端：React 19 + TypeScript + Vite + Tailwind CSS
- 后端：Express / Vercel Serverless
- AI：DeepSeek（生产优先）/ Google Gemini（开发环境）

## 本地运行

**环境要求：** Node.js 20+

```bash
cd app
npm install
cp .env.example .env.local
# 编辑 .env.local，填入 DEEPSEEK_API_KEY 或 GEMINI_API_KEY
npm run dev
```

浏览器访问 `http://localhost:5173`。

## 许可证

本项目为海南航天文旅内部使用，未经授权请勿对外传播。
