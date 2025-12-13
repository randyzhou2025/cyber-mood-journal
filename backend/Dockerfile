# 1️⃣ 使用官方 Node LTS
FROM node:18-alpine

# 2️⃣ 设置工作目录
WORKDIR /app

# 3️⃣ 先拷贝依赖描述文件（利用 Docker 缓存）
COPY package*.json ./

# 4️⃣ 安装依赖
RUN npm ci

# 5️⃣ 拷贝源码
COPY . .

# 6️⃣ 构建 TypeScript
RUN npm run build

# 7️⃣ 设置生产环境
ENV NODE_ENV=production

# 8️⃣ 暴露端口（和 CloudBase 配置的 3001 一致）
EXPOSE 3001

# 9️⃣ 启动应用
CMD ["node", "dist/main.js"]
