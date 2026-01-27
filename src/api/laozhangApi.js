import axios from 'axios';

/**
 * 🍌 Banana AI - 前端 API 服务
 * 
 * 安全模式: 通过后端代理调用 AI API，保护 API Key
 * 后端代理: /api/generate (Cloudflare Functions)
 */

// 检测是否在开发环境（本地开发时可以直接调用 AI API）
const isDev = import.meta.env.DEV;

// 开发环境配置（仅本地使用，生产环境通过后端代理）
const DEV_API_BASE_URL = import.meta.env.VITE_AI_BASE_URL || 'https://api.n1n.ai/v1beta';
const DEV_API_KEY = import.meta.env.VITE_AI_API_KEY;
const DEV_MODEL_ID = import.meta.env.VITE_AI_MODEL_ID || 'gemini-3-pro-image-preview';

// 开发环境的 axios 实例
const devApiClient = isDev && DEV_API_KEY ? axios.create({
  baseURL: DEV_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${DEV_API_KEY}`,
  },
  timeout: 120000,
}) : null;

const base64ToBlob = async (base64Data, mimeType) => {
  const dataUrl = `data:${mimeType};base64,${base64Data}`;
  const res = await fetch(dataUrl);
  return res.blob();
};

/**
 * 辅助: 压缩图片并转为 Base64
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
 * 核心生成函数
 * 
 * 生产环境: 通过后端代理 /api/generate 调用（保护 API Key）
 * 开发环境: 可直接调用 AI API（方便调试）
 */
const generateContent = async ({ prompt, images = [], aspectRatio, resolution }) => {
  try {
    // 生产环境：使用后端代理
    if (!isDev || !DEV_API_KEY) {
      console.log('🚀 发送请求 (通过后端代理)');

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          images,
          aspectRatio,
          resolution
        }),
      });

      const data = await response.json();

      if (!data.success) {
        return {
          success: false,
          error: data.error || '生成失败'
        };
      }

      // 将 base64 转为 Blob URL
      if (data.imageBase64 && data.mimeType) {
        const imageBlob = await base64ToBlob(data.imageBase64, data.mimeType);
        const imageUrl = URL.createObjectURL(imageBlob);

        return {
          success: true,
          imageUrl: imageUrl,
          imageBlob: imageBlob,
          mimeType: data.mimeType,
        };
      }

      return {
        success: false,
        error: '未能获取图片'
      };
    }

    // 开发环境：直接调用 AI API（方便本地调试）
    console.log('🚀 发送请求 (开发模式 - 直接调用 AI API)');

    // 构造增强提示词
    let enhancedPrompt = prompt;
    if (resolution === '4k') {
      enhancedPrompt += ', extreme detail, 4k resolution, ultra hd';
    } else if (resolution === '2k') {
      enhancedPrompt += ', high detail, 2k resolution';
    }
    if (aspectRatio) {
      enhancedPrompt += `, aspect ratio ${aspectRatio}`;
    }

    // 构造 parts 数组
    const parts = [{ text: enhancedPrompt }];

    if (images && images.length > 0) {
      images.forEach(img => {
        let base64Data = img;
        let mimeType = 'image/jpeg';

        if (img.startsWith('data:')) {
          const match = img.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            mimeType = match[1];
            base64Data = match[2];
          }
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
      contents: [{ role: "user", parts: parts }],
      generationConfig: {
        responseModalities: ["image", "text"],
        imageConfig: { aspectRatio, imageSize: finalResolution },
        image_config: { aspect_ratio: aspectRatio, image_size: finalResolution },
        aspectRatio,
        image_size: finalResolution,
      },
      image: { image_size: finalResolution, aspect_ratio: aspectRatio },
      aspectRatio,
      image_size: finalResolution,
    };

    const response = await devApiClient.post(
      `/models/${DEV_MODEL_ID}:generateContent?aspectRatio=${aspectRatio}&image_size=${finalResolution}`,
      requestBody
    );

    // 解析响应
    const candidates = response.data?.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error('API 返回内容为空');
    }

    const candidateParts = candidates[0]?.content?.parts || [];
    let imageUrl = null;
    let imageBlob = null;
    let imageMimeType = null;
    let imageBase64 = null;

    for (const part of candidateParts) {
      const inlineData = part.inline_data || part.inlineData;
      if (inlineData) {
        const { mime_type, mimeType, data } = inlineData;
        imageMimeType = mime_type || mimeType || 'image/jpeg';
        imageBase64 = data;
      }
    }

    if (imageBase64 && imageMimeType) {
      imageBlob = await base64ToBlob(imageBase64, imageMimeType);
      imageUrl = URL.createObjectURL(imageBlob);
    }

    if (imageUrl) {
      return {
        success: true,
        imageUrl,
        imageBlob,
        mimeType: imageMimeType,
      };
    } else {
      return {
        success: false,
        error: '无法解析图片'
      };
    }

  } catch (error) {
    console.error('❌ Generation Error:', error.response?.data || error.message);
    const errorMsg = error.response?.data?.error?.message || error.message;

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
  strength = 0.75,
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
  compressImage,
};
