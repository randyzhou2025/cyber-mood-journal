# ===== 1. 构建阶段 =====
FROM node:18-bullseye-slim AS builder

WORKDIR /app

# 复制依赖文件
COPY package.json package-lock.json ./

RUN npm install

# 复制源码
COPY . .

# 构建 Next.js
RUN npm run build

# ===== 2. 运行阶段 =====
FROM node:18-bullseye-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# 只复制运行所需文件
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js

# Next.js 运行端口
EXPOSE 3000

# 启动 Next.js
CMD ["npm", "run", "start"]
