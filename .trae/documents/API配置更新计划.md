# API配置更新计划

## 目标

将项目的AI API从GRSAI替换为新的n1n.ai API服务

## 配置信息

* **API Key**: `sk-WcyeamAtPGxdT1VoOIte521VSkLCmXIsez8yB48jspV8gFxW`

* **API Base URL**: `https://api.n1n.ai/v1`

* **API Provider**: `openai`

* **Model ID**: `gemini-3-pro-image-preview`

## 修改步骤

### 1. 更新环境变量配置

**文件**: `.env.example`

* 替换现有的`VITE_GRSAI_API_KEY`为新的API Key配置

* 添加新的环境变量支持

### 2. 重构API服务文件

**文件**: `src/api/laozhangApi.js`

* 修改API基础URL和认证方式

* 更新模型名称配置

* 重写API请求逻辑以适配新的API格式

* 调整响应处理和轮询机制

### 3. 更新API调用逻辑

**关键修改点**:

* 修改`API_BASE_URL`为`https://api.n1n.ai/v1`

* 更新认证头为`Authorization: Bearer ${API_KEY}`

* 替换模型名称为`gemini-3-pro-image-preview`

* 调整请求体格式以适配OpenAI兼容的API

* 更新响应处理逻辑

### 4. 测试和验证

* 确保所有API调用功能正常

* 验证文本生成图像功能

* 验证图生图/多图融合功能

* 验证再次修改功能

## 实施说明

1. **环境变量**:

   * 本地开发: 更新`.env.local`文件

   * Netlify部署: 在Netlify后台更新环境变量

2. **API兼容性**:

   * 新API采用OpenAI兼容格式，需要调整请求和响应处理

   * 需要移除原有的轮询机制，改为直接获取结果

3. **部署后配置**:

   * 在Netlify项目的环境变量设置中添加新的API Key

   * 确保环境变量在Production、Preview和Development环境中都已配置

## 预期结果

* 项目能够成功调用新的n1n.ai API服务

* 所有图像生成功能正常工作

* 部署到Netlify后能够正常使用

## 后续步骤

1. 完成代码修改后，本地测试所有功能
2. 提交代码到GitHub
3. 在Netlify后台更新环境变量
4. 触发新的部署
5. 验证部署后的功能

