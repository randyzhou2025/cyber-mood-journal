# Cyber Mood Journal - 微信小程序端 (Taro React + TS)

## 安装
```bash
cd mini-frontend
npm install
```

## 开发 (微信小程序)
```bash
npm run dev:weapp
```
运行后用微信开发者工具导入 `dist` 目录（`project.config.json` 已在根目录），即可预览。

## 构建
```bash
npm run build:weapp
```

## 配置
- API 基础地址：`src/services/request.ts` 里的 `BASE_URL`，默认 `http://localhost:3001`，可通过环境变量 `TARO_APP_API_BASE` 覆盖。
- 页面：`src/pages/index/index.tsx` 时间轴列表（极简科技风）。
- 接口：`src/services/diary.ts` 封装了 `/diary` 的 GET/POST/DELETE，以及 `/upload` 上传（按钮“上传图片”示例）。

## 待办
- 接入真实上传：小程序侧用 `Taro.chooseMedia` + `Taro.uploadFile`，后端提供上传签名/直传。
- 位置：`Taro.getLocation` 获取经纬度，后端存储地址文本与坐标。
- 登录：视需要接入 wx.login / openid，后端做会话绑定。
