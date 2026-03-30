import { useState, useEffect, useRef } from 'react';
import { Input, Typography, Spin } from 'antd';
import { ArrowUpOutlined } from '@ant-design/icons';
import { sendChat, getChatHistory } from '../api';

const { Title, Text } = Typography;

export default function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    getChatHistory().then(r => setMessages(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg, id: Date.now() }]);
    setLoading(true);

    try {
      const res = await sendChat(userMsg);
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply, id: Date.now() + 1 }]);
    } catch (err) {
      const detail = err.response?.data?.detail || err.message || '网络连接中断';
      setMessages(prev => [...prev, { role: 'assistant', content: `服务不可用 (${detail})`, id: Date.now() + 1 }]);
    }
    setLoading(false);
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)', maxWidth: 840, margin: '0 auto', position: 'relative' }}>
      
      <div className="ambient-glow" style={{ opacity: 0.8 }}></div>

      <div style={{ textAlign: 'center', marginBottom: 24, position: 'relative', zIndex: 1 }}>
        <Title level={3} style={{ fontWeight: 600, margin: 0, letterSpacing: '-0.01em' }}>
          <span className="gemini-text-glow">Aura Intelligence</span>
        </Title>
        <Text style={{ color: '#c4c7c5', fontSize: 13 }}>由前沿多模态大模型驱动的专属健康伴侣</Text>
      </div>

      <div className="apple-card" style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
        zIndex: 1,
        background: 'rgba(30, 31, 34, 0.6)', 
        backdropFilter: 'blur(20px)'
      }}>
        
        <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: '32px 40px', scrollBehavior: 'smooth' }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: 100, color: '#c4c7c5' }}>
              <div style={{ width: 64, height: 64, margin: '0 auto 24px', borderRadius: '50%', background: 'var(--gemini-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </div>
              <p style={{ fontSize: 18, fontWeight: 500, color: '#e3e3e3', marginBottom: 8 }}>您好，我是 Aura。</p>
              <p style={{ fontSize: 14, lineHeight: 1.6 }}>基于您最新的体征数据，<br/>我能为您提供个性化的深层健康洞察。</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      padding: '12px 18px', 
                      background: isUser ? '#2a2b2f' : 'transparent',
                      color: '#e3e3e3',
                      borderRadius: 20,
                      whiteSpace: 'pre-wrap', 
                      lineHeight: 1.6,
                      fontSize: 15,
                      maxWidth: '85%',
                      border: isUser ? '1px solid rgba(255,255,255,0.05)' : 'none'
                    }}>
                      {!isUser && (
                         <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="url(#geminiGlow)">
                              <defs>
                                <linearGradient id="geminiGlow" x1="0" y1="0" x2="24" y2="24">
                                  <stop offset="0%" stopColor="#4285f4"/>
                                  <stop offset="50%" stopColor="#9b72cb"/>
                                  <stop offset="100%" stopColor="#d96570"/>
                                </linearGradient>
                              </defs>
                              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                            </svg>
                            <span style={{ fontSize: 13, fontWeight: 600 }} className="gemini-text-glow">Aura</span>
                         </div>
                      )}
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              {loading && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ padding: '12px 18px' }}>
                    <Spin size="small" /> <span style={{ marginLeft: 8, color: '#c4c7c5', fontSize: 14 }}>Aura 正在生成洞察...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ padding: '16px 24px', background: 'rgba(30,31,34,0.8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#131314', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: '4px 6px' }}>
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onPressEnter={handleSend}
              placeholder="向 Aura 提问..."
              disabled={loading}
              bordered={false}
              style={{ fontSize: 15, padding: '8px 16px', color: '#e3e3e3', background: 'transparent' }}
            />
            <div 
              onClick={handleSend}
              style={{ 
                width: 32, height: 32, 
                borderRadius: '50%', 
                background: input.trim() ? '#e3e3e3' : '#3c4043', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: input.trim() ? 'pointer' : 'default',
                transition: 'background 0.2s ease',
                flexShrink: 0
              }}>
              <ArrowUpOutlined style={{ color: input.trim() ? '#131314' : '#757575', fontSize: 16 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
