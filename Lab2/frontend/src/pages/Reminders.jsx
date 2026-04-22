import { useState, useEffect } from 'react';
import { Typography, Tabs, Badge, Empty, message } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Armchair, Droplets, AlertTriangle, CheckCheck, Sparkles } from 'lucide-react';
import { getReminders, markReminderRead, markAllRead, checkReminders } from '../api';

const { Title, Text } = Typography;

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

const typeConfig = {
  sedentary: { icon: Armchair, color: 'var(--aura-accent)', label: '久坐提醒', bg: 'rgba(227, 255, 0, 0.1)' },
  water: { icon: Droplets, color: 'var(--aura-blue)', label: '饮水提醒', bg: 'rgba(0, 122, 255, 0.1)' },
  abnormal: { icon: AlertTriangle, color: 'var(--aura-pink)', label: '异常预警', bg: 'rgba(217, 101, 112, 0.1)' },
};

function formatTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
  return `${Math.floor(diff / 86400)} 天前`;
}

export default function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const fetchReminders = async () => {
    try {
      const params = {};
      if (activeTab !== 'all') params.type = activeTab;
      const res = await getReminders(params);
      setReminders(res.data);
    } catch {}
  };

  useEffect(() => { fetchReminders(); }, [activeTab]);

  const handleMarkRead = async (id) => {
    try {
      await markReminderRead(id);
      setReminders(prev => prev.map(r => r.id === id ? { ...r, is_read: true } : r));
    } catch {
      message.error('操作失败');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      setReminders(prev => prev.map(r => ({ ...r, is_read: true })));
      message.success('全部标记为已读');
    } catch {
      message.error('操作失败');
    }
  };

  const handleCheck = async () => {
    setLoading(true);
    try {
      const res = await checkReminders();
      if (res.data.length > 0) {
        message.success(`检测到 ${res.data.length} 条新提醒`);
        fetchReminders();
      } else {
        message.info('暂无新的健康提醒');
      }
    } catch {
      message.error('检查失败');
    }
    setLoading(false);
  };

  const unreadCount = reminders.filter(r => !r.is_read).length;

  const renderContent = (list) => {
    if (list.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '80px 0' }}
        >
          <Sparkles size={48} style={{ color: 'var(--text-tertiary)', marginBottom: 16 }} />
          <Text style={{ color: 'var(--text-tertiary)', fontSize: 16, display: 'block' }}>
            暂无提醒，您的健康状况良好
          </Text>
        </motion.div>
      );
    }
    return (
      <motion.div variants={container} initial="hidden" animate="show">
        <AnimatePresence>
          {list.map(reminder => {
            const config = typeConfig[reminder.type] || typeConfig.sedentary;
            const Icon = config.icon;
            return (
              <motion.div
                key={reminder.id}
                variants={item}
                layout
                onClick={() => !reminder.is_read && handleMarkRead(reminder.id)}
                style={{
                  cursor: reminder.is_read ? 'default' : 'pointer',
                  marginBottom: 12,
                }}
              >
                <div
                  className="bento-card"
                  style={{
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    borderLeft: `3px solid ${config.color}`,
                    opacity: reminder.is_read ? 0.6 : 1,
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: config.bg, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Icon size={20} color={config.color} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Text style={{ fontWeight: 600, fontSize: 14, color: config.color }}>
                        {config.label}
                      </Text>
                      {!reminder.is_read && (
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: 'var(--aura-blue)', flexShrink: 0,
                        }} />
                      )}
                    </div>
                    <Text style={{ color: 'var(--text-secondary)', fontSize: 13, display: 'block' }}>
                      {reminder.message}
                    </Text>
                  </div>

                  <Text style={{ color: 'var(--text-tertiary)', fontSize: 12, flexShrink: 0 }}>
                    {formatTime(reminder.triggered_at)}
                  </Text>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{ paddingBottom: 80 }}
    >
      <div className="ambient-glow-v3" />

      <header style={{ marginBottom: 40, marginTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
              <div className="glass-pill" style={{ width: 'fit-content', marginBottom: 16 }}>
                <Bell size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                Smart Alerts
              </div>
              <Title level={1} className="syne-display" style={{ fontSize: 'clamp(28px, 4vw, 44px)', margin: 0 }}>
                <span className="gemini-gradient-text">智能提醒</span>
              </Title>
              <Text style={{ fontSize: 16, color: 'var(--text-secondary)', display: 'block', marginTop: 8 }}>
                {unreadCount > 0 ? `您有 ${unreadCount} 条未读提醒` : '所有提醒已读，状态良好'}
              </Text>
            </motion.div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleCheck}
              disabled={loading}
              style={{
                background: 'var(--aura-blue)', color: '#fff', border: 'none',
                padding: '10px 20px', borderRadius: 100, fontSize: 14, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
              }}
            >
              立即检查
            </motion.button>
            {unreadCount > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleMarkAllRead}
                style={{
                  background: 'transparent', color: 'var(--text-secondary)',
                  border: '1px solid var(--glass-border-bright)',
                  padding: '10px 20px', borderRadius: 100, fontSize: 14, fontWeight: 500,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <CheckCheck size={16} /> 全部已读
              </motion.button>
            )}
          </div>
        </div>
      </header>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { key: 'all', label: `全部 (${reminders.length})`, children: renderContent(reminders) },
          { key: 'sedentary', label: '久坐提醒', children: renderContent(reminders.filter(r => r.type === 'sedentary')) },
          { key: 'water', label: '饮水提醒', children: renderContent(reminders.filter(r => r.type === 'water')) },
          { key: 'abnormal', label: '异常预警', children: renderContent(reminders.filter(r => r.type === 'abnormal')) },
        ]}
        style={{ marginBottom: 24 }}
      />
    </motion.div>
  );
}
