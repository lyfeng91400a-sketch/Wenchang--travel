# 文昌文旅助手 (Wenchang Tourism Assistant)

海南文昌文旅 AI 旅游助手原型，提供景点推荐、美食打卡、行程规划等智能问答服务。

## 在线预览

| 版本 | 地址 | 说明 |
|------|------|------|
| 静态原型 | https://lyfeng91400a-sketch.github.io/Wenchang--travel/ | 仅 UI + 预设问答 |
| 完整 AI 版 | Render 部署后的 `.onrender.com` 地址 | 支持自由 AI 对话 |

## Render 部署（完整 AI 对话）

1. 在 [Render Dashboard](https://dashboard.render.com) 连接 GitHub 仓库 `Wenchang--travel`
2. 选择 **New Web Service**，Render 会自动读取根目录的 `render.yaml`
3. 在 **Environment** 中添加 API Key（二选一）：
   - `DEEPSEEK_API_KEY` — 推荐，https://platform.deepseek.com
   - `GEMINI_API_KEY` — https://aistudio.google.com/apikey
4. 点击 **Deploy**，等待构建完成即可获得公网地址

**手动配置（如未自动识别）：**

| 配置项 | 值 |
|--------|-----|
| Root Directory | `文昌文旅助手` |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |
| Runtime | Node |

## 本地运行

```bash
cd 文昌文旅助手
npm install
# 配置 .env.local 中的 DEEPSEEK_API_KEY 或 GEMINI_API_KEY
npm run dev
```

## 技术栈

- React 19 + Vite 6 + Tailwind CSS 4
- Express 后端（AI 对话 API）
- DeepSeek / Gemini 大模型
