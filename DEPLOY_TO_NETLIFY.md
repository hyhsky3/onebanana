# 🚀 部署 Banana AI 到 Netlify 指南

你的代码已经成功推送到 GitHub 仓库：[https://github.com/hyhsky3/onebanana](https://github.com/hyhsky3/onebanana)

现在，请跟随以下步骤在 Netlify 上发布你的应用：

## 第一步：登录并导入项目

1. 打开 [https://app.netlify.com/](https://app.netlify.com/) 并登录。
2. 在 Dashboard 点击 **"Add new site"** -> **"Import from existing project"**。
3. 选择 **"GitHub"**。
4. 授权 Netlify 访问你的 GitHub 账号（如果之前没授权过）。
5. 在仓库列表中搜索并选择 **`onebanana`**。

## 第二步：配置构建设置 (Build Settings)

由于项目中已经包含了 `netlify.toml` 文件，Netlify 会自动检测大部分配置：

*   **Branch to deploy**: 默认 `main` 即可
*   **Base directory**: 留空
*   **Build command**: `npm run build` (自动填充)
*   **Publish directory**: `dist` (自动填充)

**⚠️ 先不要直接点击 "Deploy site"，请看第三步！**

## 第三步：⚠️ 配置环境变量 (关键!)

由于安全原因，你的 API Key 没有上传到 GitHub，**必须**在此处手动填入。

1. 在部署配置页面下方，点击 **"Show advanced"** 或 **"Environment variables"** (现在的界面通常有个 "Add environment variables" 按钮)。
2. 点击 **"New variable"** 或 **"Add a single variable"**。
3. 依次添加以下 **4** 个变量（请复制粘贴以免出错）：

| Key (变量名) | Value (变量值) |
| :--- | :--- |
| `VITE_AI_API_KEY` | `sk-WcyeamAtPGxdT1VoOIte521VSkLCmXIsez8yB48jspV8gFxW` |
| `VITE_AI_BASE_URL` | `https://hk.n1n.ai/v1` |
| `VITE_AI_MODEL_ID` | `gemini-3-pro-image-preview` |
| `VITE_AI_PROVIDER` | `openai` |

> **提示**: 确保所有 `VITE_` 开头的变量都已添加，否则网页打开后无法绘图。

## 第四步：开始部署

1. 确认环境变量添加无误后，点击 **"Deploy site"**。
2. 等待几分钟，这期间 Netlify 会自动下载依赖并构建项目。
3. 构建完成后，顶部会显示一个绿色的链接（例如 `https://random-name-123.netlify.app`），点击即可访问！

## 第五步：(可选) 配置自定义域名

如果你有自己的域名，可以在 "Domain settings" 中添加并配置 DNS。
