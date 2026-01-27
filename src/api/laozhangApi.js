import axios from 'axios';

/**
 * 🍌 Banana AI - Google Native API Service (原生 Gemini 接口)
 * 适配环境: api.n1n.ai / Gemini-3-Pro-Image-Preview
 * 接口格式: Google Generative AI REST API
 */

// API 配置
const API_BASE_URL = import.meta.env.VITE_AI_BASE_URL || 'https://api.n1n.ai/v1beta';
const API_KEY = import.meta.env.VITE_AI_API_KEY;
const MODEL_ID = import.meta.env.VITE_AI_MODEL_ID || 'gemini-3-pro-image-preview';

// 检查 API Key
if (!API_KEY) {
  console.warn('⚠️ VITE_AI_API_KEY 环境变量未设置，请在 .env.local 或 Cloudflare Pages 后台配置');
}

// 创建 axios 实例 (Google 原生接口使用 key 作为 query 参数，以及 Bearer token 在 header)
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
  },
  timeout: 120000, // 生成图片可能较慢，设置 2分钟超时
});

const base64ToBlob = async (base64Data, mimeType) => {
  const dataUrl = `data:${mimeType};base64,${base64Data}`;
  const res = await fetch(dataUrl);
  return res.blob();
};

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
 * 核心生成函数: 使用 Google 原生 generateContent 接口
 * 
 * Google API 格式:
 * POST /v1beta/models/{model}:generateContent
 * {
 *   "contents": [
 *     {
 *       "role": "user",
 *       "parts": [
 *         { "text": "prompt" },
 *         { "inline_data": { "mime_type": "image/jpeg", "data": "base64..." } }
 *       ]
 *     }
 *   ],
 *   "generationConfig": {
 *     "responseModalities": ["image", "text"]
 *   }
 * }
 */
const generateContent = async ({ prompt, images = [], aspectRatio, resolution }) => {
  try {
    // 1. 构造增强提示词
    let enhancedPrompt = prompt;
    // 保留 Prompt 中的描述作为双重保障，但使用更自然的英语描述
    // if (aspectRatio) enhancedPrompt += `\nAspectRatio: ${aspectRatio}`;
    // if (resolution) enhancedPrompt += `\nResolution: ${resolution}`;
    
    if (resolution === '4k') {
      enhancedPrompt += ', extreme detail, 4k resolution, ultra hd';
    } else if (resolution === '2k') {
      enhancedPrompt += ', high detail, 2k resolution';
    }
    
    // 宽高比通常由参数控制，Prompt 中可选加
    if (aspectRatio) {
      enhancedPrompt += `, aspect ratio ${aspectRatio}`;
    }

    // 2. 构造 Google 原生 API 的 parts 数组
    const parts = [{ text: enhancedPrompt }];

    // 处理参考图 (Image-to-Image)
    if (images && images.length > 0) {
      images.forEach(img => {
        let base64Data = img;
        let mimeType = 'image/jpeg';

        // 如果是 data URL 格式，提取纯 base64 数据
        if (img.startsWith('data:')) {
          const match = img.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            mimeType = match[1];
            base64Data = match[2];
          }
        } else if (img.startsWith('http')) {
          // 暂不支持直接 URL，需要先下载
          console.warn('⚠️ Google 原生 API 不直接支持 URL 图片，请使用 Base64');
          return;
        }

        parts.push({
          inline_data: {
            mime_type: mimeType,
            data: base64Data
          }
        });
      });
    }

    const finalResolution = resolution ? resolution.toUpperCase() : '1K';
    
    const requestBody = {
      contents: [
        {
          role: "user",
          parts: parts
        }
      ],
      generationConfig: {
        responseModalities: ["image", "text"],
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: finalResolution
        },
        image_config: {
          aspect_ratio: aspectRatio,
          image_size: finalResolution
        },
        aspectRatio: aspectRatio,
        image_size: finalResolution,
      },
      image: {
        image_size: finalResolution,
        aspect_ratio: aspectRatio
      },
      aspectRatio: aspectRatio, 
      image_size: finalResolution,
    };

    console.log('🚀 发送绘图请求 (Google原生API):', { model: MODEL_ID, prompt: enhancedPrompt });

    // 4. 发送请求到 Google 原生端点
    const response = await apiClient.post(
      `/models/${MODEL_ID}:generateContent?aspectRatio=${aspectRatio}&image_size=${finalResolution}`,
      requestBody
    );

    // 5. 解析 Google 原生 API 返回格式
    // 返回格式:
    // {
    //   "candidates": [
    //     {
    //       "content": {
    //         "parts": [
    //           { "text": "..." },
    //           { "inline_data": { "mime_type": "image/png", "data": "base64..." } }
    //         ]
    //       }
    //     }
    //   ]
    // }

    const candidates = response.data?.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error('API 返回内容为空');
    }

    const candidateParts = candidates[0]?.content?.parts || [];
    let imageUrl = null;
    let imageBlob = null;
    let imageMimeType = null;
    let imageBase64 = null;
    let textContent = '';

    for (const part of candidateParts) {
      // 兼容下划线和驼峰命名
      const inlineData = part.inline_data || part.inlineData;
      
      if (inlineData) {
        const { mime_type, mimeType, data } = inlineData;
        imageMimeType = mime_type || mimeType || 'image/jpeg';
        imageBase64 = data;
        console.log('✅ 成功从 inline_data 提取图片');
      } else if (part.text) {
        textContent += part.text;
        // 检查文本中是否有图片 URL 或 markdown
        const markdownImageRegex = /!\[.*?\]\((.*?)\)/;
        const match = part.text.match(markdownImageRegex);
        if (match && match[1]) {
          imageUrl = match[1];
        } else {
          const urlRegex = /(https?:\/\/[^\s)]+)/;
          const urlMatch = part.text.match(urlRegex);
          if (urlMatch) {
            imageUrl = urlMatch[1];
          }
        }
      }
    }

    if (imageBase64 && imageMimeType) {
      imageBlob = await base64ToBlob(imageBase64, imageMimeType);
      imageUrl = URL.createObjectURL(imageBlob);
    }

    if (imageUrl) {
      console.log('✅ 成功提取图片');
      response.data = null;
      
      return {
        success: true,
        imageUrl: imageUrl,
        imageBlob: imageBlob,
        mimeType: imageMimeType,
      };
    } else {
      // 详细调试日志
      console.warn('⚠️ 未能从响应中提取图片');
      // 移除 JSON.stringify 完整打印，防止 Base64 数据过大导致浏览器崩溃
      // console.log('📦 完整响应数据:', JSON.stringify(response.data, null, 2)); 

      // 尝试获取更多调试信息
      const usage = response.data?.usageMetadata;
      const finishReason = candidates[0]?.finishReason;
      const safetyRatings = candidates[0]?.safetyRatings;
      
      let debugMsg = '';
      if (finishReason && finishReason !== 'STOP') {
        debugMsg += ` [结束原因: ${finishReason}]`;
      }
      if (usage) {
        debugMsg += ` [Token: ${usage.totalTokenCount}]`;
      }

      return {
        success: false,
        error: textContent 
          ? `未找到图片URL。模型返回文本: ${textContent.substring(0, 100)}...${debugMsg}` 
          : `无法解析图片。请检查控制台日志。${debugMsg} (原始响应可能是空的或格式不符)`,
        rawResponse: response.data // 返回原始数据供前端可能的展示
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
  strength = 0.75, // Google 原生接口通常很难精确控制 strength，但这参数保留
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
