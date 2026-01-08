# 🍌 Banana AI 三平台部署指南（小白版）

> 本指南面向零基础用户，每一步都会详细说明，按照步骤操作即可完成部署。

---

## 📋 部署前准备

### 你需要准备的东西

| 必备项目 | 说明 | 获取方式 |
|----------|------|----------|
| ✅ GitHub 账号 | 代码已推送至此 | 你应该已经有了 |
| ✅ GRSAI API Key | AI 图像生成密钥 | 联系服务商获取 |
| ✅ 部署平台账号 | 选择下面任意一个平台 | 下方有注册说明 |

### 你的项目仓库地址

```
https://github.com/hyhsky3/hibanana
```

---

## ☁️ 方案一：部署到 Cloudflare Pages

### 第一步：注册/登录 Cloudflare

1. 打开浏览器，访问 **https://dash.cloudflare.com/**
2. 如果没有账号，点击 **Sign up** 注册（支持邮箱注册）
3. 如果已有账号，直接登录

### 第二步：创建 Pages 项目

1. 登录后，在左侧菜单找到 **Workers 和 Pages**，点击进入
2. 点击蓝色按钮 **创建**
3. 选择 **Pages** 标签页
4. 点击 **连接到 Git**

### 第三步：连接 GitHub

1. 点击 **连接 GitHub**
2. 在弹出的窗口中，使用你的 GitHub 账号登录并授权
3. 授权后会显示你的仓库列表
4. 找到并选择 **hibanana** 仓库
5. 点击 **开始设置**

### 第四步：配置构建设置

在构建设置页面，填写以下信息：

| 设置项 | 填写内容 |
|--------|----------|
| 项目名称 | `banana-ai`（或你喜欢的名字） |
| 生产分支 | `main` |
| 框架预设 | 选择 **Vite** |
| 构建命令 | `npm run build` |
| 构建输出目录 | `dist` |

### 第五步：添加环境变量 ⚠️ 非常重要

1. 在同一页面，找到 **环境变量** 部分
2. 点击 **添加变量**
3. 填写：
   - **变量名称**: `VITE_GRSAI_API_KEY`
   - **值**: 粘贴你的 GRSAI API Key
4. 点击 **保存**

### 第六步：开始部署

1. 检查所有设置无误后，点击 **保存并部署**
2. 等待构建完成（通常需要 1-3 分钟）
3. 构建成功后，你会看到一个类似 `banana-ai.pages.dev` 的网址
4. 点击这个网址，即可访问你的应用！🎉

### 后续更新

每次你在 GitHub 上推送代码，Cloudflare Pages 会自动重新部署。

---

## 🔷 方案二：部署到 Netlify

### 第一步：注册/登录 Netlify

1. 打开浏览器，访问 **https://app.netlify.com/**
2. 点击 **Sign up** 注册
3. 推荐选择 **Sign up with GitHub**（用 GitHub 账号直接登录，最方便）

### 第二步：创建新站点

1. 登录后，点击 **Add new site**
2. 选择 **Import an existing project**
3. 点击 **Deploy with GitHub**

### 第三步：连接 GitHub 仓库

1. 如果是首次使用，需要授权 Netlify 访问你的 GitHub
2. 在仓库列表中，找到并点击 **hibanana**

### 第四步：配置构建设置

Netlify 会自动读取项目中的 `netlify.toml` 文件，你只需要确认以下设置：

| 设置项 | 应该显示的值 |
|--------|--------------|
| Branch to deploy | `main` |
| Build command | `npm run build` |
| Publish directory | `dist` |

### 第五步：添加环境变量 ⚠️ 非常重要

1. 展开 **Environment variables** 部分（或点击 Show advanced）
2. 点击 **New variable**
3. 填写：
   - **Key**: `VITE_GRSAI_API_KEY`
   - **Value**: 粘贴你的 GRSAI API Key
4. 确认添加

### 第六步：开始部署

1. 点击 **Deploy site**
2. 等待构建完成（通常需要 1-2 分钟）
3. 构建成功后，Netlify 会给你一个随机网址，如 `random-name-12345.netlify.app`
4. 点击访问你的应用！🎉

### 自定义域名（可选）

1. 在站点设置中，点击 **Domain settings**
2. 点击 **Edit site name** 可以改成你喜欢的名字
3. 比如改成 `my-banana-ai`，访问地址就变成 `my-banana-ai.netlify.app`

---

## ▲ 方案三：部署到 Vercel

### 第一步：注册/登录 Vercel

1. 打开浏览器，访问 **https://vercel.com/**
2. 点击右上角 **Sign Up**
3. 选择 **Continue with GitHub**（推荐，最方便）
4. 授权 Vercel 访问你的 GitHub 账号

### 第二步：导入项目

1. 登录后，点击 **Add New...** → **Project**
2. 在 **Import Git Repository** 部分，你会看到你的 GitHub 仓库列表
3. 找到 **hibanana**，点击右侧的 **Import** 按钮

### 第三步：配置项目

Vercel 会自动检测到这是一个 Vite 项目，检查以下设置：

| 设置项 | 应该显示的值 |
|--------|--------------|
| Framework Preset | `Vite` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

### 第四步：添加环境变量 ⚠️ 非常重要

1. 展开 **Environment Variables** 部分
2. 填写：
   - **Name**: `VITE_GRSAI_API_KEY`
   - **Value**: 粘贴你的 GRSAI API Key
3. 点击 **Add** 添加

### 第五步：开始部署

1. 确认所有设置后，点击 **Deploy**
2. 等待构建完成（通常需要 1-2 分钟）
3. 构建成功后，会显示一个预览页面和访问链接
4. 链接格式类似 `hibanana.vercel.app`
5. 点击访问你的应用！🎉

### 自定义域名（可选）

1. 进入项目设置 → **Domains**
2. 可以添加自己的域名，或修改 Vercel 子域名

---

## 🔧 常见问题解决

### Q1: 构建失败，提示 Node.js 版本问题

**解决方法**：在环境变量中添加：
- 变量名: `NODE_VERSION`
- 值: `18`

### Q2: 部署成功但页面空白

**可能原因**：环境变量没有正确配置

**解决方法**：
1. 检查环境变量名是否正确：必须是 `VITE_GRSAI_API_KEY`（注意大小写）
2. 检查 API Key 是否正确粘贴（没有多余的空格）
3. 重新触发部署（在平台上点击重新部署）

### Q3: 图片生成失败

**可能原因**：
1. API Key 无效或过期
2. 网络问题

**解决方法**：
1. 联系 GRSAI 服务商确认 API Key 状态
2. 打开浏览器开发者工具（按 F12）查看控制台错误信息

### Q4: 如何更新已部署的应用？

只需要在本地修改代码后推送到 GitHub：
```bash
git add .
git commit -m "更新内容"
git push origin main
```
三个平台都会自动检测到更新并重新部署。

---

## 📊 三个平台对比

| 特性 | Cloudflare Pages | Netlify | Vercel |
|------|------------------|---------|--------|
| 免费额度 | 无限带宽 | 100GB/月 | 100GB/月 |
| 构建速度 | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| 国内访问 | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| 易用性 | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 推荐度 | 推荐（国内访问快） | 推荐 | 强烈推荐（最简单） |

---

## 🎉 恭喜你！

如果你已经完成了上述任意一个平台的部署，你的 **Banana AI** 应用已经上线了！

你可以：
- 📤 把链接分享给朋友
- 📱 在手机上访问使用
- 🔄 随时更新代码，自动重新部署

如有问题，欢迎随时提问！
