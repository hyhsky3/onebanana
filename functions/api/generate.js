/**
 * 🍌 Banana AI - Cloudflare Functions 后端代理
 * 
 * 用途: 保护 API Key 不暴露给前端
 * 部署: Cloudflare Pages Functions
 * 路径: /api/generate
 */

export async function onRequestPost(context) {
    const { request, env } = context;

    // 从服务器环境变量读取配置（不带 VITE_ 前缀，前端无法访问）
    const API_KEY = env.AI_API_KEY;
    const API_BASE_URL = env.AI_BASE_URL || 'https://api.n1n.ai/v1beta';
    const MODEL_ID = env.AI_MODEL_ID || 'gemini-3-pro-image-preview';

    // 检查 API Key
    if (!API_KEY) {
        return new Response(JSON.stringify({
            success: false,
            error: 'AI_API_KEY 环境变量未配置'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        // 解析前端请求
        const body = await request.json();
        const { prompt, images = [], aspectRatio = '1:1', resolution = '1k' } = body;

        if (!prompt) {
            return new Response(JSON.stringify({
                success: false,
                error: '缺少 prompt 参数'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

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

        // 构造 Google 原生 API 的 parts 数组
        const parts = [{ text: enhancedPrompt }];

        // 处理参考图
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

        // 构造请求体
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

        // 调用 Google 原生 API
        const apiUrl = `${API_BASE_URL}/models/${MODEL_ID}:generateContent?aspectRatio=${aspectRatio}&image_size=${finalResolution}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('AI API Error:', errorText);
            return new Response(JSON.stringify({
                success: false,
                error: `AI API 错误: ${response.status} ${response.statusText}`
            }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const data = await response.json();

        // 解析响应
        const candidates = data?.candidates;
        if (!candidates || candidates.length === 0) {
            return new Response(JSON.stringify({
                success: false,
                error: 'API 返回内容为空'
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const candidateParts = candidates[0]?.content?.parts || [];
        let imageBase64 = null;
        let imageMimeType = null;
        let textContent = '';

        for (const part of candidateParts) {
            const inlineData = part.inline_data || part.inlineData;

            if (inlineData) {
                const { mime_type, mimeType, data } = inlineData;
                imageMimeType = mime_type || mimeType || 'image/jpeg';
                imageBase64 = data;
            } else if (part.text) {
                textContent += part.text;
            }
        }

        if (imageBase64 && imageMimeType) {
            return new Response(JSON.stringify({
                success: true,
                imageBase64: imageBase64,
                mimeType: imageMimeType,
                textContent: textContent
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            return new Response(JSON.stringify({
                success: false,
                error: textContent
                    ? `未找到图片。模型返回: ${textContent.substring(0, 200)}...`
                    : '无法解析图片',
                textContent: textContent
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

    } catch (error) {
        console.error('Generate Error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: `服务器错误: ${error.message}`
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
