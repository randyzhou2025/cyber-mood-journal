FROM node:18-alpine

WORKDIR /app

# 1️⃣ 拷贝依赖描述
COPY package*.json ./

# 2️⃣ 安装依赖
RUN npm ci

# 3️⃣ 拷贝源码（包括 prisma/schema.prisma）
COPY . .

# 4️⃣ 生成 Prisma Client（🔥关键）
RUN npx prisma generate

# 5️⃣ 构建 NestJS（TS → dist）
RUN npm run build

# 6️⃣ 生产环境
ENV NODE_ENV=production

# 7️⃣ 暴露端口
EXPOSE 3001

# 8️⃣ 启动服务（按你项目实际入口）
CMD ["node", "dist/main.js"]
