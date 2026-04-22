import { useState, useEffect, useRef } from 'react';
import { Input, Typography, Spin } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, User, Bot, ArrowUp } from 'lucide-react';
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
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    const tempId = Date.now();
    setMessages(prev => [...prev, { role: 'user', content: userMsg, id: tempId }]);
    setLoading(true);

    try {
      const res = await sendChat(userMsg);
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply, id: tempId + 1 }]);
    } catch (err) {
      const detail = err.response?.data?.detail || '网络连接超时';
      setMessages(prev => [...prev, { role: 'assistant', content: `[Aura Error] ${detail}`, id: tempId + 1 }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: 'calc(100vh - 160px)', 
      maxWidth: 900, 
      margin: '0 auto', 
      position: 'relative' 
    }}>
      <div className="ambient-glow-v3" />
      
      <header style={{ textAlign: 'center', marginBottom: 32 }}>
        <Title level={2} className="outfit" style={{ fontWeight: 700, margin: 0 }}>
          <span className="gemini-gradient-text">Aura Intelligence</span>
        </Title>
        <Text style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>基于您今日体征数据的多模态深度健康洞察</Text>
      </header>

      <div className="bento-card" style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        padding: 0,
        background: 'rgba(22, 22, 24, 0.4)',
        backdropFilter: 'blur(32px)',
        border: '1px solid var(--glass-border)'
      }}>
        
        <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: '40px', scrollBehavior: 'smooth' }}>
          <AnimatePresence initial={false}>
            {messages.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', marginTop: 80 }}
              >
                <div style={{ 
                  width: 72, height: 72, 
                  margin: '0 auto 32px', 
                  borderRadius: '18px', 
                  background: 'var(--aura-blue)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: '0 0 40px rgba(66, 133, 244, 0.2)'
                }}>
                  <Sparkles size={32} color="white" />
                </div>
                <Title level={3} className="outfit" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>我是 Aura</Title>
                <Text style={{ fontSize: 16, color: 'var(--text-tertiary)', lineHeight: 1.8 }}>
                  您的私人办公健康助手。您可以询问关于心率、<br/>血压趋势，或是如何缓解办公疲劳。
                </Text>
              </motion.div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                {messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <motion.div 
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      style={{ 
                        display: 'flex', 
                        gap: 20,
                        flexDirection: isUser ? 'row-reverse' : 'row',
                        alignItems: 'flex-start'
                      }}
                    >
                      <div style={{ 
                        width: 36, height: 36, 
                        borderRadius: '10px', 
                        background: isUser ? 'var(--bg-card-hover)' : 'var(--aura-blue)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                        border: '1px solid var(--glass-border)'
                      }}>
                        {isUser ? <User size={18} color="var(--text-secondary)" /> : <Bot size={18} color="white" />}
                      </div>
                      
                      <div style={{
                        padding: isUser ? '14px 20px' : '0', 
                        background: isUser ? 'var(--bg-card-hover)' : 'transparent',
                        borderRadius: '18px',
                        color: 'var(--text-primary)',
                        maxWidth: '75%',
                        lineHeight: 1.7,
                        fontSize: 15,
                        border: isUser ? '1px solid var(--glass-border)' : 'none'
                      }}>
                        {msg.content}
                      </div>
                    </motion.div>
                  );
                })}
                {loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: 20 }}>
                     <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--aura-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Bot size={18} color="white" />
                      </div>
                      <div style={{ padding: '12px 0' }}>
                        <Spin size="small" />
                      </div>
                  </motion.div>
                )}
              </div>
            )}
          </AnimatePresence>
        </div>

        <div style={{ padding: '24px 40px 40px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            background: 'var(--bg-card)', 
            border: '1px solid var(--glass-border)', 
            borderRadius: '20px', 
            padding: '8px 12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }}>
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onPressEnter={handleSend}
              placeholder="向 Aura 询问您的健康建议..."
              bordered={false}
              style={{ fontSize: 16, padding: '8px 16px', color: 'var(--text-primary)', background: 'transparent' }}
            />
            <motion.div 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSend}
              style={{ 
                width: 40, height: 40, 
                borderRadius: '14px', 
                background: input.trim() ? 'var(--aura-blue)' : 'var(--bg-card-hover)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: input.trim() ? 'pointer' : 'default',
                transition: 'all 0.3s var(--ease-out-expo)'
              }}>
              <ArrowUp size={20} color={input.trim() ? 'white' : 'var(--text-tertiary)'} />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

