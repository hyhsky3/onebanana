# 🚀 部署 Banana AI 到 Cloudflare Pages 指南

你的代码已经托管在 GitHub：[https://github.com/hyhsky3/onebanana](https://github.com/hyhsky3/onebanana)

Cloudflare Pages 是一个非常快速且免费的静态网站托管服务，非常适合本项目。

## 第一步：连接 GitHub

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)。
2. 在左侧菜单点击 **"Workers & Pages"** (或者 **"Compute (Workers)"**)。
3. 点击右上角的 **"Create application"** (创建应用)。
4. 点击 **"Pages"** 标签页，然后点击 **"Connect to Git"**。
5. 选择 **"GitHub"**，如果您是第一次使用，需要授权 Cloudflare 访问您的 GitHub 仓库。
6. 在仓库列表中选择 **`onebanana`**，点击 **"Begin setup"**。

## 第二步：配置构建 (Build Settings)

Cloudflare 对 Vite 项目有很好的支持，请确保以下设置正确：

*   **Project name**: 给项目起个名字（例如 `onebanana-ai`），这会决定您的子域名。
*   **Production branch**: `main`
*   **Framework preset (框架预设)**: 选择 **`Vite`** (非常重要！选了这个后下面的选项会自动填充)。
*   **Build command**: `npm run build`
*   **Build output directory**: `dist`

## 第三步：⚠️ 配置环境变量 (关键!)

在点击部署按钮之前，必须添加环境变量，否则应用无法运行。

1. 在设置页面找到 **"Environment variables (advanced)"** (环境变量 - 高级) 部分。
2. 点击展开，然后点击 **"Add variable"**。
3. 依次添加以下 **4** 个变量（请仔细复制）：

| Variable name (变量名) | Value (变量值) |
| :--- | :--- |
| `VITE_AI_API_KEY` | `sk-WcyeamAtPGxdT1VoOIte521VSkLCmXIsez8yB48jspV8gFxW` |
| `VITE_AI_BASE_URL` | `https://hk.n1n.ai/v1` |
| `VITE_AI_PROVIDER` | `openai` |
| `VITE_AI_MODEL_ID` | `gemini-3-pro-image-preview` |

## 第四步：部署

1. 确认所有设置无误后，点击 **"Save and Deploy"**。
2. Cloudflare 将开始拉取代码并构建。构建过程通常需要 1-2 分钟。
3. 显示 **"Success"** 后，点击顶部的链接（例如 `https://onebanana.pages.dev`）即可访问！

## (可选) 自定义域名

部署完成后，您可以点击 **"Custom domains"** 标签页，将您在 Cloudflare 上的域名（如果有）绑定到这个项目。
