import { useState } from 'react';
import { Sparkles, Image as ImageIcon } from 'lucide-react';
import TextToImage from './components/TextToImage';
import ImageToImage from './components/ImageToImage';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('text-to-image');

  const tabs = [
    { id: 'text-to-image', label: '文本生成图像', icon: Sparkles },
    { id: 'image-to-image', label: '图生图 / 多图融合', icon: ImageIcon },
  ];

  return (
    <div className="app">
      {/* 头部 */}
      <header className="app-header">
        <div className="container">
          <div className="header-content">
            <div className="logo-section">
              <div className="logo-icon">🍌</div>
              <h1 className="logo-text">
                Banana <span className="gradient-text">AI</span>
              </h1>
            </div>
            <p className="tagline">基于 Nano Banana Pro 的智能图像生成工具</p>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="app-main">
        <div className="container">
          {/* 标签页导航 */}
          <div className="tabs-container glass-card">
            <div className="tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon size={20} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 标签页内容 */}
          <div className="tab-content fade-in">
            <div style={{ display: activeTab === 'text-to-image' ? 'block' : 'none' }}>
              <TextToImage />
            </div>
            <div style={{ display: activeTab === 'image-to-image' ? 'block' : 'none' }}>
              <ImageToImage />
            </div>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="app-footer">
        <div className="container footer-content">
          <p>Powered by Nano Banana Pro</p>
          <div className="footer-info">
            <span>开发者: Mr.Huang</span>
            <span>邮箱: zshyh@foxmail.com</span>
            <span>公众号: 人工智能与教学资源</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
