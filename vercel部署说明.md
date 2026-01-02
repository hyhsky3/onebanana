# 🍌 Banana AI - Vercel 部署指南

本项目是一个基于 Vite + React 构建的高级图像生成应用，已针对 Vercel 平台进行了深度优化。请按照以下步骤进行部署：

## 1. 准备工作

在开始部署前，请确保您拥有以下信息：
- **项目代码**：已推送至 GitHub 仓库。
- **GRSAI API Key**：您的 Nano Banana Pro 接口密钥。

## 2. 部署步骤（推荐：Vercel Dashboard）

这是最简单、最推荐的部署方式。

1.  **关联 GitHub**：
    登录 [Vercel 官网](https://vercel.com/)，点击 **"Add New"** -> **"Project"**，导入您的 GitHub 仓库。

2.  **配置工程信息**：
    Vercel 通常会自动识别为 Vite 项目。请确认以下配置：
    - **Framework Preset**: `Vite`
    - **Build Command**: `npm run build`
    - **Output Directory**: `dist`

3.  **配置环境变量 (关键)**：
    展开 **"Environment Variables"** 栏目，添加以下变量：
    - **Key**: `VITE_GRSAI_API_KEY`
    - **Value**: `您的 API Key` (例如：`sk-cb6ce7c6...`)

4.  **点击 Deploy**：
    稍等片刻，Vercel 将自动完成依赖安装、代码构建和全球分发。

---

## 3. 高级配置说明

### 3.1 路由重定向 (`vercel.json`)
为了支持单页应用 (SPA) 的路由，项目根目录已包含 `vercel.json` 文件：
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
这确保了刷新页面时不会出现 404 错误。

### 3.2 性能优化
本项目已启用 **Base64 直传技术**，减少了对第三方图床的依赖，在 Vercel 的全球加速网络下，图片生成任务的提交速度将得到显著提升。

## 4. 常见问题排查

- **部署失败 (Build Error)**：
  - 检查 `package.json` 中的 `dependencies` 是否完整。
  - 确保 Node.js 版本设置为 `20.x` 或更高（在 Vercel 项目设置中修改）。
- **接口 401/403 错误**：
  - 请检查 Vercel 环境变量中的 `VITE_GRSAI_API_KEY` 是否正确设置。
  - 修改环境变量后，需要重新点击 **"Redeploy"** 才能生效。
- **请求体过大 (413 Error)**：
  - 如果上传多张超大图片导致失败，请尝试减少上传数量或略微调低 `laozhangApi.js` 中的压缩分辨率。

---

**祝您使用愉快！**
*如有疑问，请联系开发者: Mr.Huang (zshyh@foxmail.com)*
