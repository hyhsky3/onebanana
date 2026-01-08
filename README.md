# 🍌 Banana AI - 智能图像生成工具

一款基于 **Nano Banana Pro (Gemini 3 Pro)** 模型的现代化 AI 图像生成应用，专为极致视觉体验而设计。

## ✨ 核心特性

- **文生图 (Text-to-Image)**: 支持 1K/2K/4K 超高清分辨率及多种宽高比适配。
- **图生图 & 融合 (Image-to-Image / Multi-Fusion)**: 
  - 支持上传 1-10 张参考图进行智能融合。
  - 采用 Base64 直传技术，无需额外图床配置。
- **再次修改 (Iterative Refinement)**: 支持对生成的图像进行连续对话式修改。
- **极致美学**: 采用磨砂玻璃拟态 (Glassmorphism) 暗黑风格界面，流畅的微动画交互。

## 🚀 快速启动

### 方法 1：一键启动 (推荐)
直接双击项目目录下的 **`启动应用.bat`** 文件即可自动打开浏览器并启动服务。

### 方法 2：开发者启动
如果你具备 Node.js 环境，可以使用以下命令：
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

---

## 🌐 部署指南

本项目支持同时部署到 **Cloudflare Pages**、**Netlify** 和 **Vercel**，三个平台配置基本相同。

### 📦 通用配置

| 配置项 | 值 |
|--------|-----|
| 框架预设 | Vite |
| 构建命令 | `npm run build` |
| 构建输出目录 | `dist` |
| Node.js 版本 | 18 或更高 |

### 🔑 环境变量

| 变量名 | 说明 | 必填 |
|--------|------|------|
| `VITE_GRSAI_API_KEY` | GRSAI API 密钥 | ✅ 必填 |
| `VITE_IMGBB_API_KEY` | ImgBB 图床 API 密钥 | ⭕ 可选（当前未启用） |

> ⚠️ **注意**: 环境变量必须以 `VITE_` 开头才能在前端代码中访问。

---

### ☁️ 部署到 Cloudflare Pages

#### 步骤 1: 推送到 GitHub
```bash
git add .
git commit -m "准备部署"
git push origin main
```

#### 步骤 2: 创建 Cloudflare Pages 项目
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** → **创建应用程序** → **Pages** → **连接到 Git**
3. 选择你的 GitHub 仓库

#### 步骤 3: 配置构建设置
- 框架预设: 选择 `Vite`
- 构建命令: `npm run build`
- 输出目录: `dist`

#### 步骤 4: 配置环境变量
在 **设置** → **环境变量** 中添加 `VITE_GRSAI_API_KEY`

#### 步骤 5: 部署
点击 **保存并部署**，等待构建完成。

---

### 🔷 部署到 Netlify

项目已包含 `netlify.toml` 配置文件，部署更加简便。

#### 步骤 1: 推送到 GitHub
```bash
git add .
git commit -m "准备部署"
git push origin main
```

#### 步骤 2: 创建 Netlify 项目
1. 登录 [Netlify Dashboard](https://app.netlify.com/)
2. 点击 **Add new site** → **Import an existing project**
3. 选择 **GitHub**，授权并选择你的仓库

#### 步骤 3: 确认构建设置
Netlify 会自动读取 `netlify.toml`，确认以下设置：
- Build command: `npm run build`
- Publish directory: `dist`

#### 步骤 4: 配置环境变量
在 **Site configuration** → **Environment variables** 中添加 `VITE_GRSAI_API_KEY`

#### 步骤 5: 部署
点击 **Deploy site**，等待构建完成。

---

### ▲ 部署到 Vercel

项目已包含 `vercel.json` 配置文件。

#### 步骤 1: 推送到 GitHub
```bash
git add .
git commit -m "准备部署"
git push origin main
```

#### 步骤 2: 创建 Vercel 项目
1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 **Add New...** → **Project**
3. 选择 **Import Git Repository**，选择你的 GitHub 仓库

#### 步骤 3: 确认构建设置
Vercel 会自动检测 Vite 框架并读取 `vercel.json`：
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

#### 步骤 4: 配置环境变量
在 **Settings** → **Environment Variables** 中添加 `VITE_GRSAI_API_KEY`

> 💡 **提示**: 确保在 Environment 中勾选 `Production`、`Preview` 和 `Development`

#### 步骤 5: 部署
点击 **Deploy**，等待构建完成。

---

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | React 19 + Vite 7 |
| HTTP 客户端 | Axios |
| 图标库 | Lucide React |
| 图片处理 | Canvas 压缩 + Base64 直传 |
| AI 模型 | GRSAI Nano Banana Pro |

### 核心文件说明
| 文件 | 说明 |
|------|------|
| `src/api/laozhangApi.js` | 核心 API 服务（图片压缩、AI 调用） |
| `src/components/TextToImage.jsx` | 文生图组件 |
| `src/components/ImageToImage.jsx` | 图生图 / 多图融合组件 |
| `netlify.toml` | Netlify 部署配置 |
| `vercel.json` | Vercel 部署配置 |

---

## 📄 本地开发

1. 复制环境变量示例文件：
```bash
cp .env.example .env.local
```

2. 编辑 `.env.local` 填入你的 API Key：
```env
VITE_GRSAI_API_KEY=your_actual_key_here
```

3. 启动开发服务器：
```bash
npm run dev
```

---

## 📝 获取 API Key

### GRSAI API Key
联系 GRSAI 服务提供商获取。

### ImgBB API Key（可选，当前未启用）
1. 访问 [https://api.imgbb.com/](https://api.imgbb.com/)
2. 注册账号并登录
3. 获取免费的 API Key

---

*Powered by Nano Banana Pro & GRSAI API*
