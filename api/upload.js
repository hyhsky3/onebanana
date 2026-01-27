export default async function handler(req, res) {
    // 设置 CORS 响应头，允许本地开发环境跨域
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { base64 } = req.body;
        if (!base64) {
            return res.status(400).json({ message: 'Missing base64 data' });
        }

        // 剔除前缀 (ImgBB API 只接受纯 base64)
        const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, "");

        const apiKey = process.env.IMGBB_API_KEY || process.env.VITE_IMGBB_API_KEY;
        if (!apiKey) {
            return res.status(500).json({
                success: false,
                error: 'Missing IMGBB_API_KEY environment variable'
            });
        }

        // 发送到 ImgBB
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ image: cleanBase64 })
        });

        const data = await response.json();

        if (data.success) {
            // 返回 ImgBB 生成的直链 URL
            return res.status(200).json({
                success: true,
                url: data.data.url
            });
        } else {
            console.error('ImgBB API Error');
            return res.status(data.status || 500).json({
                success: false,
                error: data.error?.message || 'ImgBB 上传失败'
            });
        }
    } catch (error) {
        console.error('Internal Server Error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
}
