import { useState, useEffect } from 'react';
import { Row, Col, Typography } from 'antd';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getRecords, getLatestRecord } from '../api';

const { Title, Text } = Typography;

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
    心率: r.heart_rate,
    收缩压: r.systolic_bp,
  }));

  const StatPill = ({ title, value, unit, glowColor }) => (
    <div className="apple-card" style={{ padding: '24px 32px', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -50, right: -50, width: 100, height: 100, background: glowColor, filter: 'blur(50px)', opacity: 0.15 }}></div>
      <Text style={{ fontSize: 15, fontWeight: 500, color: '#c4c7c5', marginBottom: 16 }}>
        {title}
      </Text>
      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <Text style={{ fontSize: 44, fontWeight: 600, color: '#e3e3e3', letterSpacing: '-0.02em', lineHeight: 1 }}>
          {value}
        </Text>
        <Text style={{ fontSize: 16, fontWeight: 500, color: '#86868b' }}>
          {unit}
        </Text>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <Title style={{ marginBottom: 16, fontSize: 48, fontWeight: 600, letterSpacing: '-0.01em' }}>
          <span className="gemini-text-glow">掌握健康脉络</span>
        </Title>
        <Text style={{ color: '#c4c7c5', fontSize: 16 }}>一切数据尽在掌握之中。</Text>
      </div>

      {latest ? (
        <>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} lg={6}>
              <StatPill title="静息心率" value={latest.heart_rate} unit="次/分" glowColor="#d96570" />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatPill title="血压" value={`${latest.systolic_bp}/${latest.diastolic_bp}`} unit="mmHg" glowColor="#4285f4" />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatPill title="步数" value={(latest.steps / 1000).toFixed(1)} unit="万步" glowColor="#fbbc04" />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatPill title="睡眠" value={latest.sleep_hours} unit="小时" glowColor="#9b72cb" />
            </Col>
          </Row>

          {chartData.length > 0 && (
            <div className="apple-card" style={{ marginTop: 40, padding: '40px 48px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200, background: 'linear-gradient(135deg, rgba(66, 133, 244, 0.05), rgba(155, 114, 203, 0.05))', pointerEvents: 'none' }}></div>
              <div style={{ marginBottom: 32, position: 'relative', zIndex: 1 }}>
                <Title level={3} style={{ fontWeight: 600, margin: 0, color: '#e3e3e3' }}>趋势与洞察</Title>
                <Text style={{ color: '#c4c7c5', fontSize: 14 }}>过去 14 天的体征演变。</Text>
              </div>
              <div style={{ height: 360, width: '100%', transform: 'translateX(-10px)', position: 'relative', zIndex: 1 }}>
                <ResponsiveContainer>
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d96570" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#d96570" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSys" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4285f4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4285f4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#86868b', fontSize: 12, fontWeight: 500}} dy={15} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#86868b', fontSize: 12, fontWeight: 500}} />
                    <Tooltip 
                      cursor={{ stroke: '#4285f4', strokeWidth: 1, strokeDasharray: '3 3', opacity: 0.5 }}
                      contentStyle={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(30,31,34,0.9)', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
                      itemStyle={{ fontWeight: 600, color: '#e3e3e3' }}
                    />
                    <Area type="monotone" dataKey="心率" stroke="#d96570" strokeWidth={3} fillOpacity={1} fill="url(#colorHr)" />
                    <Area type="monotone" dataKey="收缩压" stroke="#4285f4" strokeWidth={3} fillOpacity={1} fill="url(#colorSys)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="apple-card" style={{ padding: '80px 40px', textAlign: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: 600, color: '#e3e3e3' }}>尚未获取数据源。</Text>
          <div style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 14, color: '#86868b' }}>现在就去记录您的第一组生命体征吧。</Text>
          </div>
        </div>
      )}
    </div>
  );
}
