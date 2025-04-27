# AI Chatbox 技术规范文档 (更新版)

## 1. 项目概述

AI Chatbox 是一个基于 OpenAI API 的聊天工具，具有现代化的用户界面、流畅的动画效果以及简单的博客功能。博客文章通过 Node.js 后端和 MySQL 数据库进行持久化存储。

## 2. 技术栈

- 前端框架：React (使用 Vite)
- 路由：React Router DOM v6
- 样式：Tailwind CSS
- 动画：(基础 CSS 过渡)
- 状态管理：React Context API
- 数据持久化 (前端):
  - localStorage (用于主题、非敏感 AI 设置)
- API 集成 (前端):
  - `fetch` API (用于调用后端博客 API `/api/...`)
  - OpenAI API (通过 `openai` 库直接调用，**极不安全，需改为后端代理**)
- Markdown 渲染: react-markdown, remark-gfm
- 代码高亮: react-syntax-highlighter
- 后端框架: Node.js, Express
- 后端 API 中间件: CORS
- 数据库: MySQL (通过 `mysql2` 库访问)

## 3. 项目结构

```
.
├── dist/              # 前端构建输出
├── public/
├── server/            # 后端代码
│   ├── node_modules/
│   ├── package.json
│   ├── package-lock.json
│   └── server.js      # Express 服务器, 数据库逻辑, API 端点
├── src/               # 前端 React 源代码
│   ├── components/    # 可复用 UI 组件
│   ├── pages/         # 页面级组件 (Blog, NewPost)
│   ├── services/      # API 服务 (openai.js - 需重构)
│   ├── context/       # React Context (AppContext.jsx - 包含博客 API 调用)
│   ├── styles/        # CSS (globals.css)
│   ├── App.jsx        # 主应用组件和路由
│   └── main.jsx       # React 应用入口
├── .htaccess          # Apache 配置 (若使用)
├── index.html         # HTML 入口
├── vite.config.js     # Vite 配置
├── tailwind.config.js # Tailwind 配置
├── postcss.config.js  # PostCSS 配置
├── package.json       # 前端依赖和脚本 (不含 mysql2, 含 openai)
├── package-lock.json
├── README.md
├── DEPLOY.md
└── TECHNICAL_SPEC.md
```

## 4. 核心功能

### 4.1 聊天功能

- 实时对话界面 (`/chat`, `/`)
- 消息历史 (内存状态, 导航时不清空)。
- Markdown 和代码高亮。
- OpenAI API 集成 (`services/openai.js` **直接调用，不安全**)。
- 可配置的系统提示词、模型、参数。
- 加载状态、错误处理。

### 4.2 设置功能 (`SettingsPanel`)

- AI API 配置: API Key (临时状态), API Base URL (localStorage)。
- 模型选择、参数调整 (localStorage)。
- 系统提示词 (localStorage)。
- 安全警告。

### 4.3 博客功能

- 博客列表页面 (`/blog`)。
- 新建帖子表单 (`/blog/new`)。
- **数据通过后端 API (`/api/posts`) 与 MySQL 数据库交互。**
- 帖子内容支持 Markdown。
- **图片上传功能缺失后端支持。**

### 4.4 数据持久化

- **后端 (MySQL):** Blog Posts (id, title, content, imageUrl, timestamp)。
- **前端 (localStorage):** Theme (dark/light), Non-sensitive AI settings (apiBase, model, temperature, maxTokens, systemPrompt)。
- **前端 (内存):** Chat History, API Key (临时)。

## 5. UI/UX

- 响应式设计 (Tailwind CSS)。
- 统一风格 (颜色、圆角)。
- 设置面板为模态框。
- 博客列表卡片式。
- 导航栏激活状态。

## 6. 部署 (宝塔面板 + Nginx 反向代理)

- **前端:** 使用 Vite 构建静态文件 (`npm run build` -> `dist` 目录)，部署到网站根目录。
- **后端:** 将 `server` 目录部署到服务器，使用 PM2 运行 `server.js`。
- **数据库:** 确保后端能连接到 MySQL 数据库。
- **Nginx 配置 (关键):**
  - **反向代理:** 将 `/api/` 路径转发到后端 Node.js 服务 (如 `http://127.0.0.1:3001/`)。
  - **URL 重写 (伪静态):** 配置 SPA 规则，将所有非文件请求指向 `index.html`。
- 参考 `README.md` 获取详细步骤。

## 7. 安全性

- **关键风险**: OpenAI API Key 在前端处理 (`openai` 库)。**必须**迁移到后端代理模式，由后端负责调用 OpenAI API。
- **CORS:** 后端 `cors` 配置应在生产环境中限制为特定来源域名。

## 8. 待办/可优化项

- **[高优] 实现 OpenAI 后端代理。**
- **[中优] 实现博客图片上传后端 (`/api/upload`) 及前端对接。**
- **[中优] 调整 CSS 解决文字颜色/对比度问题。**
- [低优] 增加博客编辑/删除功能 (DELETE 已有，编辑需实现)。
- [低优] 增加单元/集成测试。
- [低优] 优化 UI 动画。
- [低优] 优化大量消息/帖子的性能 (虚拟滚动)。
