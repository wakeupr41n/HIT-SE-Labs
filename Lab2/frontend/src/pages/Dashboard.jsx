import { useState, useEffect } from 'react';
import { Typography } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Droplets, 
  Moon, 
  Footprints, 
  TrendingUp, 
  Sparkles,
  Heart
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getRecords, getLatestRecord } from '../api';

const { Title, Text } = Typography;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

export default function Dashboard() {
  const [latest, setLatest] = useState(null);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    getLatestRecord().then(r => setLatest(r.data)).catch(() => {});
    getRecords(14).then(r => {
      const sorted = r.data.sort((a, b) => new Date(a.record_date) - new Date(b.record_date));
      setRecords(sorted);
    }).catch(() => {});
  }, []);

  const chartData = records.map(r => ({
    date: new Date(r.record_date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
    hr: r.heart_rate,
    bp: r.systolic_bp,
  }));

  if (!latest) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 2 }}>
        <Sparkles size={48} className="aura-purple" style={{ opacity: 0.5 }} />
      </motion.div>
    </div>
  );

  return (
    <div style={{ paddingBottom: 80 }}>
      <div className="ambient-glow-v3" />
      
      <header style={{ marginBottom: 60, marginTop: 20 }}>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          <div className="glass-pill" style={{ width: 'fit-content', marginBottom: 24 }}>Aura Intelligence Pro</div>
          <Title level={1} style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 700, margin: 0 }}>
            <span className="gemini-gradient-text">你好，{latest.user_id ? '准备好今天的健康挑战了吗？' : '欢迎回来'}</span>
          </Title>
          <Text style={{ fontSize: 18, color: 'var(--text-secondary)', display: 'block', marginTop: 12 }}>
            基于您的生物体征，今天建议保持专注并适当补水。
          </Text>
        </motion.div>
      </header>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="bento-grid"
        style={{ gridTemplateRows: 'repeat(2, 240px)' }}
      >
        {/* Vital Signs - Large Card (2x2) */}
        <motion.div variants={item} className="bento-card" style={{ gridColumn: 'span 2', gridRow: 'span 2', background: 'linear-gradient(135deg, #1a1a1c 0%, #161618 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Title level={4} style={{ color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 4 }}>核心生命体征</Title>
              <Text style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>实时监测与基准对比</Text>
            </div>
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              <Heart fill="#d96570" color="#d96570" size={24} />
            </motion.div>
          </div>

          <div style={{ marginTop: 40, display: 'flex', gap: 60 }}>
            <div>
              <Text style={{ fontSize: 14, color: 'var(--text-tertiary)', display: 'block', marginBottom: 8 }}>静息心率</Text>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 56, fontWeight: 600, fontFamily: 'Outfit' }}>{latest.heart_rate}</span>
                <span style={{ fontSize: 16, color: 'var(--text-tertiary)' }}>BPM</span>
              </div>
            </div>
            <div>
              <Text style={{ fontSize: 14, color: 'var(--text-tertiary)', display: 'block', marginBottom: 8 }}>当前血压</Text>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 56, fontWeight: 600, fontFamily: 'Outfit' }}>{latest.systolic_bp}</span>
                <span style={{ fontSize: 24, color: 'var(--text-tertiary)', fontWeight: 300 }}>/ {latest.diastolic_bp}</span>
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: 'auto', padding: '16px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid var(--glass-border)' }}>
            <Text style={{ fontSize: 13, color: 'var(--aura-blue)', fontWeight: 500 }}>
              <TrendingUp size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              心率较上周平均水平降低了 4%，状态极佳
            </Text>
          </div>
        </motion.div>

        {/* Activity - Horizontal Card (2x1) */}
        <motion.div variants={item} className="bento-card" style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Footprints size={20} color="var(--aura-orange)" />
              <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>每日动态</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 48, fontWeight: 600, fontFamily: 'Outfit' }}>{latest.steps}</span>
              <span style={{ color: 'var(--text-tertiary)' }}>/ 10,000</span>
            </div>
            <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 10, marginTop: 16, overflow: 'hidden' }}>
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${Math.min((latest.steps/10000)*100, 100)}%` }} 
                transition={{ duration: 1.5, ease: "easeOut" }}
                style={{ height: '100%', background: 'var(--aura-orange)' }} 
              />
            </div>
          </div>
          <div style={{ width: 120, height: '100%', opacity: 0.5 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.slice(-5)}>
                <Area type="monotone" dataKey="hr" stroke="var(--aura-orange)" fill="var(--aura-orange)" fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Sleep - Square (1x1) */}
        <motion.div variants={item} className="bento-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <Moon size={20} color="var(--aura-purple)" style={{ marginBottom: 16 }} />
          <Text style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>深度睡眠</Text>
          <div style={{ marginTop: 'auto' }}>
            <span style={{ fontSize: 40, fontWeight: 600, fontFamily: 'Outfit' }}>{latest.sleep_hours}</span>
            <span style={{ fontSize: 14, color: 'var(--text-tertiary)', marginLeft: 6 }}>hrs</span>
          </div>
        </motion.div>

        {/* Water - Square (1x1) */}
        <motion.div variants={item} className="bento-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <Droplets size={20} color="var(--aura-blue)" style={{ marginBottom: 16 }} />
          <Text style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>累计饮水</Text>
          <div style={{ marginTop: 'auto' }}>
            <span style={{ fontSize: 40, fontWeight: 600, fontFamily: 'Outfit' }}>{latest.water_intake}</span>
            <span style={{ fontSize: 14, color: 'var(--text-tertiary)', marginLeft: 6 }}>ml</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Chart - Full Width Wide Bento */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ delay: 0.5, duration: 1 }}
        className="bento-card" 
        style={{ marginTop: 20, padding: '40px 48px', minHeight: 400 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
          <div>
             <Title level={3} style={{ fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>长期数据趋势</Title>
             <Text style={{ color: 'var(--text-tertiary)' }}>对比 14 天内的各项体征波动曲线</Text>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--aura-pink)' }} />
              <Text style={{ fontSize: 12, color: 'var(--text-secondary)' }}>心率</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--aura-blue)' }} />
              <Text style={{ fontSize: 12, color: 'var(--text-secondary)' }}>收缩压</Text>
            </div>
          </div>
        </div>

        <div style={{ height: 300, width: '100%', marginLeft: -20 }}>
          <ResponsiveContainer>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="glowHr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--aura-pink)" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="var(--aura-pink)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: 'var(--text-tertiary)', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-tertiary)', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)' }}
                itemStyle={{ color: '#fff', fontSize: 13 }}
              />
              <Area type="monotone" dataKey="hr" stroke="var(--aura-pink)" strokeWidth={3} fill="url(#glowHr)" />
              <Area type="monotone" dataKey="bp" stroke="var(--aura-blue)" strokeWidth={3} fill="transparent" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}

