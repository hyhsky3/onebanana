import { useState, useEffect } from 'react';
import { Wand2, Download, Loader2 } from 'lucide-react';
import { textToImage, imageToImage } from '../api/laozhangApi';
import './TextToImage.css';

const ASPECT_RATIOS = [
    { value: '1:1', label: '1:1 (正方形)' },
    { value: '16:9', label: '16:9 (横屏)' },
    { value: '9:16', label: '9:16 (竖屏)' },
    { value: '3:2', label: '3:2 (横屏)' },
    { value: '2:3', label: '2:3 (竖屏)' },
    { value: '4:3', label: '4:3 (横向)' },
    { value: '3:4', label: '3:4 (竖向)' },
];

const RESOLUTIONS = [
    { value: '1k', label: '1K (快速)' },
    { value: '2k', label: '2K (标准)' },
    { value: '4k', label: '4K (高清)' },
];

const STORAGE_KEY = 'banana_ai_text_v1';

const loadSavedState = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return {};
        if (raw.length > 200000) {
            localStorage.removeItem(STORAGE_KEY);
            return {};
        }
        return JSON.parse(raw);
    } catch {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch {
        }
        return {};
    }
};

function TextToImage() {
    // 从 localStorage 初始化状态
    const savedState = loadSavedState();

    const [prompt, setPrompt] = useState(savedState.prompt || '');
    const [negativePrompt, setNegativePrompt] = useState(savedState.negativePrompt || '');
    const [aspectRatio, setAspectRatio] = useState(savedState.aspectRatio || '1:1');
    const [resolution, setResolution] = useState(savedState.resolution || '2k');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [refinePrompt, setRefinePrompt] = useState('');

    // 监听状态变化并同步到 localStorage
    useEffect(() => {
        const stateToSave = {
            prompt,
            negativePrompt,
            aspectRatio,
            resolution,
        };
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        } catch (e) {
            console.warn('LocalStorage save failed (possibly full):', e);
        }
    }, [prompt, negativePrompt, aspectRatio, resolution]);

    useEffect(() => {
        const urlToRevoke = result?.imageUrl;
        return () => {
            if (urlToRevoke && urlToRevoke.startsWith('blob:')) {
                URL.revokeObjectURL(urlToRevoke);
            }
        };
    }, [result?.imageUrl]);

    const blobToBase64Data = (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const dataUrl = reader.result;
                const base64 = String(dataUrl).split(',')[1] || '';
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('请输入提示词');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await textToImage({
                prompt,
                negativePrompt,
                aspectRatio,
                resolution,
            });

            if (response.success) {
                setResult({
                    imageUrl: response.imageUrl,
                    imageBlob: response.imageBlob || null,
                    mimeType: response.mimeType || null,
                });
            } else {
                setError(response.error);
            }
        } catch (err) {
            setError('生成失败,请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    // 新增: 精修处理函数
    const handleRefine = async () => {
        if (!result?.imageUrl) return;
        if (!refinePrompt.trim()) {
            setError('请输入修改提示词');
            return;
        }

        setLoading(true);
        setError(null);

        const currentResultImage = result.imageUrl;
        setResult(null);

        try {
            const base64Str = result.imageBlob
                ? await blobToBase64Data(result.imageBlob)
                : (currentResultImage.startsWith('data:') ? currentResultImage.split(',')[1] : '');

            if (!base64Str) {
                setError('当前图片无法用于再次修改，请重新生成');
                return;
            }

            const response = await imageToImage({
                images: [base64Str],
                prompt: refinePrompt,
                strength: 0.75,
                aspectRatio,
                resolution,
            });

            if (response.success) {
                setResult({
                    imageUrl: response.imageUrl,
                    imageBlob: response.imageBlob || null,
                    mimeType: response.mimeType || null,
                });
                setRefinePrompt('');
            } else {
                setError(response.error);
            }
        } catch (err) {
            setError('修改失败,请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (!result?.imageUrl) return;

        const link = document.createElement('a');
        const mimeType = result.mimeType || 'image/png';
        const ext = mimeType.includes('jpeg') ? 'jpg' : (mimeType.includes('webp') ? 'webp' : 'png');

        if (result.imageBlob) {
            const objectUrl = URL.createObjectURL(result.imageBlob);
            link.href = objectUrl;
            link.download = `banana-ai-${Date.now()}.${ext}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(objectUrl);
            return;
        }

        link.href = result.imageUrl;
        link.download = `banana-ai-${Date.now()}.${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="text-to-image">
            <div className="generation-panel glass-card">
                <h2 className="panel-title">
                    <Wand2 size={24} />
                    文本生成图像
                </h2>

                {/* 提示词输入 */}
                <div className="form-group">
                    <label className="label">提示词 *</label>
                    <textarea
                        className="input textarea"
                        placeholder="描述你想要生成的图像,例如:一只可爱的橙色小猫在花园里玩耍,阳光明媚,高质量,细节丰富"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={4}
                    />
                </div>

                {/* 负面提示词 */}
                <div className="form-group">
                    <label className="label">负面提示词(可选)</label>
                    <input
                        type="text"
                        className="input"
                        placeholder="描述你不想要的元素,例如:模糊,低质量,变形"
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                    />
                </div>

                {/* 参数选择 */}
                <div className="params-grid">
                    {/* 宽高比 */}
                    <div className="form-group">
                        <label className="label">宽高比</label>
                        <div className="radio-group">
                            {ASPECT_RATIOS.map((ratio) => (
                                <label key={ratio.value} className="radio-label">
                                    <input
                                        type="radio"
                                        name="text-aspectRatio"
                                        value={ratio.value}
                                        checked={aspectRatio === ratio.value}
                                        onChange={(e) => setAspectRatio(e.target.value)}
                                    />
                                    <span className="radio-custom">{ratio.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* 分辨率 */}
                    <div className="form-group">
                        <label className="label">分辨率</label>
                        <div className="radio-group">
                            {RESOLUTIONS.map((res) => (
                                <label key={res.value} className="radio-label">
                                    <input
                                        type="radio"
                                        name="text-resolution"
                                        value={res.value}
                                        checked={resolution === res.value}
                                        onChange={(e) => setResolution(e.target.value)}
                                    />
                                    <span className="radio-custom">{res.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 生成按钮 */}
                <button
                    className="btn btn-primary btn-generate"
                    onClick={handleGenerate}
                    disabled={loading || !prompt.trim()}
                >
                    {loading ? (
                        <>
                            <Loader2 size={20} className="spinner" />
                            生成中...
                        </>
                    ) : (
                        <>
                            <Wand2 size={20} />
                            开始生成
                        </>
                    )}
                </button>

                {/* 错误提示 */}
                {error && (
                    <div className="error-message slide-up">
                        ⚠️ {error}
                    </div>
                )}
            </div>

            {/* 结果展示或加载占位 */}
            {(loading || result) && (
                <div className="result-column fade-in">
                    {loading && !result ? (
                        <div className="result-panel glass-card">
                            <div className="result-header">
                                <h3>正在生成...</h3>
                            </div>
                            <div className="result-image-container">
                                <div className="skeleton-loading">
                                    <Loader2 size={48} className="spinner" />
                                    <p className="loading-text-dynamic">
                                        {['正在捕捉灵感...', '正在画布上落笔...', '魔法正在发生...', '正在调色中...', '细节雕刻中...'][Math.floor(Date.now() / 2000) % 5]}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="result-panel glass-card">
                            <div className="result-header">
                                <h3>生成结果</h3>
                                <button className="btn btn-secondary" onClick={handleDownload}>
                                    <Download size={18} />
                                    下载图像
                                </button>
                            </div>
                            <div className="result-image-container">
                                <img
                                    src={result.imageUrl}
                                    alt="Generated"
                                    className="result-image"
                                />
                            </div>
                            <div className="result-info">
                                <p><strong>提示词:</strong> {prompt}</p>
                                <p><strong>参数:</strong> {aspectRatio} • {resolution.toUpperCase()}</p>
                            </div>
                        </div>
                    )}

                    {/* 精修面板 (仅在生成成功后显示) */}
                    {result && !loading && (
                        <div className="refine-panel glass-card">
                            <h4 className="refine-title">✨ 再次修改 (基于当前结果)</h4>
                            <div className="refine-input-group">
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="例如: 增加一些灯光效果..."
                                    value={refinePrompt}
                                    onChange={(e) => setRefinePrompt(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                                />
                                <button
                                    className="btn btn-primary btn-refine"
                                    onClick={handleRefine}
                                    disabled={loading || !refinePrompt.trim()}
                                >
                                    {loading ? <Loader2 size={18} className="spinner" /> : '发送'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default TextToImage;
