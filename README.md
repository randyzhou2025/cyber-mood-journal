# Cyber Mood Journal

TypeScript 全栈（Next.js + React + NestJS）的小程序风格项目，核心功能是记录日常心情感悟，以时间轴展示，支持图片上传与地点标记。UI 走赛博朋克风。

## 目录结构

- frontend/ — Next.js 13 + React 前端，时间轴页面示例
- backend/ — NestJS API，提供日记增删查、图片上传（PostgreSQL 持久化）
- mini-frontend/ — Taro React 小程序端，时间轴 + 图片上传按钮

## 使用

### 前端
```bash
cd frontend
npm install
npm run dev    # http://localhost:3000
```

### 后端
```bash
cd backend
npm install
npm run start:dev   # http://localhost:3001
```

API 示例：
- `GET /diary` — 获取列表
- `POST /diary` — 创建
- `DELETE /diary/:id` — 删除
- `POST /upload` — 上传图片，返回 `{ url }`

#### 数据库
- 依赖 PostgreSQL，默认连接串 `postgres://postgres:postgres@localhost:5432/cyber_mood_journal`，可通过环境变量 `DATABASE_URL` 覆盖。
- 使用 Prisma，模型在 `backend/prisma/schema.prisma`，可执行 `npm run prisma:generate`、`npm run prisma:migrate` 创建/更新表。模型字段：id、title、content、location、tags(text[])、images(text[])、happenedAt、createdAt。

#### 静态文件/上传
- 上传文件存储在 `uploads/`，静态访问前缀 `/uploads/`（例如 `http://localhost:3001/uploads/<filename>`）。

### 微信小程序端
详见 `mini-frontend/README.md`，核心命令：
```bash
cd mini-frontend
npm install
npm run dev:weapp
```
运行后用微信开发者工具导入根目录（使用 `project.config.json`），页面展示时间轴并带“上传图片”按钮。
