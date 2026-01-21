import axios from 'axios';

/**
 * 🍌 Banana AI - OpenAI 兼容 API Service (适配 Gemini/GPT 等模型)
 * 适配环境: hk.n1n.ai / Gemini-3-Pro-Image-Preview
 */

// API 配置
const API_BASE_URL = import.meta.env.VITE_AI_BASE_URL || 'https://hk.n1n.ai/v1';
const API_KEY = import.meta.env.VITE_AI_API_KEY;
const MODEL_ID = import.meta.env.VITE_AI_MODEL_ID || 'gemini-3-pro-image-preview';

// 检查 API Key
if (!API_KEY) {
  console.warn('⚠️ VITE_AI_API_KEY 环境变量未设置，请在 .env.local 或 Cloudflare Pages 后台配置');
}

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
  },
  timeout: 120000, // 生成图片可能较慢，设置 2分钟超时
});

/**
 * 辅助: 压缩图片并转为 Base64 (保留原有功能)
 */
export const compressImage = (file, maxWidth = 1024, maxHeight = 1024, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        // 返回纯 Base64 (不带前缀，配合现有逻辑)
        resolve(dataUrl.split(',')[1]);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

/**
 * 辅助: 仅文件转 Base64
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * 核心生成函数: 使用 Chat Completions 接口
 */
const generateContent = async ({ prompt, images = [], aspectRatio, resolution }) => {
  try {
    // 1. 构造增强提示词
    // 由于 Chat 接口可能不直接接受 aspect_ratio 参数，我们将这些要求写入 Prompt
    let enhancedPrompt = prompt;
    if (aspectRatio) enhancedPrompt += `\nAspectRatio: ${aspectRatio}`;
    if (resolution) enhancedPrompt += `\nResolution: ${resolution}`;

    // 2. 构造消息体
    const messages = [
      {
        role: "user",
        content: [
          { type: "text", text: enhancedPrompt }
        ]
      }
    ];

    // 处理参考图 (Image-to-Image)
    if (images && images.length > 0) {
      images.forEach(img => {
        let imageUrl = img;
        // 如果是纯 Base64 字符串，需要添加前缀
        if (!img.startsWith('http') && !img.startsWith('data:')) {
          imageUrl = `data:image/jpeg;base64,${img}`;
        }
        messages[0].content.push({
          type: "image_url",
          image_url: {
            url: imageUrl
          }
        });
      });
    }

    console.log('🚀 发送绘图请求 (Chat模式):', { model: MODEL_ID, prompt: enhancedPrompt });

    // 3. 发送请求
    const response = await apiClient.post('/chat/completions', {
      model: MODEL_ID,
      messages: messages,
      stream: false
    });

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) throw new Error('API 返回内容为空');

    // 4. 解析图片结果
    // Gemini/GPT 绘图在 Chat 模式下通常返回 Markdown 图片: ![img](url) 或 ![img](data:...)
    // 或者直接返回 URL

    let imageUrl = null;

    // 尝试正则匹配 Markdown 图片链接
    const markdownImageRegex = /!\[.*?\]\((.*?)\)/;
    const match = content.match(markdownImageRegex);

    if (match && match[1]) {
      imageUrl = match[1];
    } else {
      // 如果没有 markdown 格式，尝试查找是否有 http 链接
      const urlRegex = /(https?:\/\/[^\s)]+)/;
      const urlMatch = content.match(urlRegex);
      if (urlMatch) {
        imageUrl = urlMatch[1];
      } else if (content.length > 1000) {
        // 如果内容很长且不是 markdown，可能是纯 Base64? 当然这种情况较少见
        // 假设部分代理直接返回 base64 文本
        // 这里做一个简单的清理尝试
        const cleanContent = content.trim();
        if (cleanContent.startsWith('/9j/') || cleanContent.startsWith('iVBOR')) {
          imageUrl = `data:image/jpeg;base64,${cleanContent}`;
        }
      }
    }

    if (imageUrl) {
      console.log('✅ 成功提取图片');
      return {
        success: true,
        data: response.data,
        imageUrl: imageUrl
      };
    } else {
      console.warn('⚠️ 未能从响应中提取图片，原始内容:', content.substring(0, 200) + '...');
      // 有时候模型可能会拒绝绘画，返回文本解释
      return {
        success: false,
        error: content || '未生成图片，模型可能拒绝了请求',
      };
    }

  } catch (error) {
    console.error('❌ Generation Error:', error.response?.data || error.message);
    const errorMsg = error.response?.data?.error?.message || error.message;

    // 特定错误处理
    if (error.response?.status === 429) {
      return { success: false, error: '请求过于频繁或配额不足 (429)' };
    }

    return {
      success: false,
      error: `生成失败: ${errorMsg}`,
    };
  }
};

/**
 * 文本生成图像
 */
export const textToImage = async ({ prompt, negativePrompt = '', aspectRatio = '1:1', resolution = '1k' }) => {
  // 将 negative prompt 拼接到主 prompt
  const fullPrompt = negativePrompt
    ? `${prompt}\n(Negative Prompt: ${negativePrompt})`
    : prompt;

  return generateContent({ prompt: fullPrompt, images: [], aspectRatio, resolution });
};

/**
 * 图像生成图像 / 多图融合
 */
export const imageToImage = async ({
  images = [],
  prompt,
  strength = 0.75, // Chat 接口通常很难精确控制 strength，但这参数保留
  aspectRatio = '1:1',
  resolution = '1k'
}) => {
  return generateContent({
    prompt: prompt || 'Generate image based on input',
    images: images,
    aspectRatio,
    resolution
  });
};

/**
 * 多图融合
 */
export const multiFusion = async ({
  images,
  prompt = '',
  mode = 'blend',
  aspectRatio = '1:1',
  resolution = '1k'
}) => {
  const fusionPrompt = prompt || `Blend these images (Mode: ${mode})`;
  return generateContent({
    prompt: fusionPrompt,
    images: images,
    aspectRatio,
    resolution
  });
};

export default {
  textToImage,
  imageToImage,
  multiFusion,
  fileToBase64,
  compressImage, // 导出此函数供组件使用
};
